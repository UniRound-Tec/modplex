/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { NAV } from './landing-constants'

/**
 * Drives a viewport-locked, "分镜推进" (scene-by-scene) narrative.
 *
 * One wheel gesture / arrow key / swipe advances exactly one scene; GSAP
 * cross-fades the outgoing scene out and the incoming scene in, staggering
 * any `[data-stagger]` descendants for a silky reveal. Input is locked for
 * the duration of each transition so momentum scrolling can't skip scenes.
 *
 * Respects `prefers-reduced-motion`: transitions become instant cuts.
 */
export function useSceneNavigator(count: number) {
  const [current, setCurrent] = useState(0)
  const currentRef = useRef(0)
  const animatingRef = useRef(false)
  const scenesRef = useRef<(HTMLElement | null)[]>([])
  const refCbsRef = useRef<Record<number, (el: HTMLElement | null) => void>>({})
  const wheelAccRef = useRef(0)

  // Stable callback-ref per index so scenes aren't detached/reattached on
  // every `current` change (which would null out scenesRef mid-transition).
  const registerScene = useCallback((index: number) => {
    if (!refCbsRef.current[index]) {
      refCbsRef.current[index] = (el: HTMLElement | null) => {
        scenesRef.current[index] = el
      }
    }
    return refCbsRef.current[index]
  }, [])

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Initial state: scene 0 visible + a gentle staggered entrance, the rest
  // parked and hidden.
  useEffect(() => {
    const scenes = scenesRef.current
    scenes.forEach((el, i) => {
      if (!el) return
      const active = i === 0
      el.dataset.active = String(active)
      gsap.set(el, { autoAlpha: active ? 1 : 0, y: 0 })
    })
    const first = scenes[0]
    if (first && !prefersReducedMotion()) {
      const items = first.querySelectorAll('[data-stagger]')
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.07,
          delay: 0.1,
        }
      )
    }
  }, [])

  const goto = useCallback(
    (target: number) => {
      const from = currentRef.current
      const clamped = Math.max(0, Math.min(count - 1, target))
      if (animatingRef.current || clamped === from) return

      const scenes = scenesRef.current
      const outgoing = scenes[from]
      const incoming = scenes[clamped]
      if (!outgoing || !incoming) return

      const dir = clamped > from ? 1 : -1
      const commit = () => {
        currentRef.current = clamped
        setCurrent(clamped)
      }

      if (prefersReducedMotion()) {
        outgoing.dataset.active = 'false'
        gsap.set(outgoing, { autoAlpha: 0 })
        incoming.dataset.active = 'true'
        gsap.set(incoming, { autoAlpha: 1, y: 0 })
        commit()
        return
      }

      animatingRef.current = true
      incoming.dataset.active = 'true'

      const items = incoming.querySelectorAll('[data-stagger]')
      const tl = gsap.timeline({
        defaults: { duration: NAV.duration },
        onComplete: () => {
          outgoing.dataset.active = 'false'
          gsap.set(outgoing, { autoAlpha: 0, y: 0 })
          animatingRef.current = false
          wheelAccRef.current = 0
          commit()
        },
      })

      tl.to(outgoing, {
        autoAlpha: 0,
        y: -36 * dir,
        ease: 'power2.in',
      })
        .fromTo(
          incoming,
          { autoAlpha: 0, y: 48 * dir },
          { autoAlpha: 1, y: 0, ease: 'power3.out' },
          '<0.12'
        )
        .fromTo(
          items,
          { autoAlpha: 0, y: 22 * dir },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.06,
          },
          '<0.15'
        )
    },
    [count]
  )

  const next = useCallback(() => goto(currentRef.current + 1), [goto])
  const prev = useCallback(() => goto(currentRef.current - 1), [goto])

  // Wheel — accumulate delta, commit one scene per threshold crossing.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (animatingRef.current) return
      // Reset accumulator when the user reverses direction.
      if (Math.sign(e.deltaY) !== Math.sign(wheelAccRef.current)) {
        wheelAccRef.current = 0
      }
      wheelAccRef.current += e.deltaY
      if (Math.abs(wheelAccRef.current) >= NAV.wheelThreshold) {
        const dir = wheelAccRef.current > 0 ? 1 : -1
        wheelAccRef.current = 0
        goto(currentRef.current + dir)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [goto])

  // Touch — single-axis swipe.
  useEffect(() => {
    let startY = 0
    let tracking = false
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0
      tracking = true
    }
    const onMove = (e: TouchEvent) => {
      if (tracking) e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const dy = (e.changedTouches[0]?.clientY ?? startY) - startY
      if (Math.abs(dy) >= NAV.swipeThreshold) {
        goto(currentRef.current + (dy < 0 ? 1 : -1))
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [goto])

  // Keyboard — vim-ish + standard paging.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return
      }
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'j':
          e.preventDefault()
          next()
          break
        case 'ArrowUp':
        case 'PageUp':
        case 'k':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          goto(0)
          break
        case 'End':
          e.preventDefault()
          goto(count - 1)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goto, count])

  return { current, goto, next, prev, registerScene }
}
