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
import { useEffect } from 'react'
import { NothingBackground } from '@/components/nothing-background'
import { LandingHeader } from './landing-header'
import { SceneProgress } from './scene-progress'
import { SceneFlow } from './scenes/scene-flow'
import { SceneHero } from './scenes/scene-hero'
import { SceneScale } from './scenes/scene-scale'
import { SceneStart } from './scenes/scene-start'
import { useSceneNavigator } from './use-scene-navigator'

interface NarrativeLandingProps {
  isAuthenticated?: boolean
}

/**
 * Viewport-locked, GSAP-driven narrative landing ("分镜推进"). Wheel / arrow
 * keys / swipe advance one scene at a time; the page itself never scrolls, so
 * there is no scrollbar. Theme follows the global `.dark`/`.light` class.
 */
export function NarrativeLanding({ isAuthenticated }: NarrativeLandingProps) {
  const scenes = [
    <SceneHero isAuthenticated={isAuthenticated} />,
    <SceneScale />,
    <SceneFlow />,
    <SceneStart isAuthenticated={isAuthenticated} />,
  ]

  const { current, goto, registerScene } = useSceneNavigator(scenes.length)

  // Lock document scroll for the duration of the locked-viewport narrative.
  useEffect(() => {
    const { body, documentElement: html } = document
    const prevBody = body.style.overflow
    const prevHtml = html.style.overflow
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevHtmlOverscroll = html.style.overscrollBehavior
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    // Prevent the browser's pull-to-refresh / overscroll bounce on downswipe.
    body.style.overscrollBehavior = 'none'
    html.style.overscrollBehavior = 'none'
    return () => {
      body.style.overflow = prevBody
      html.style.overflow = prevHtml
      body.style.overscrollBehavior = prevBodyOverscroll
      html.style.overscrollBehavior = prevHtmlOverscroll
    }
  }, [])

  return (
    <div className='modplex-landing relative h-[100svh] w-full overflow-hidden select-none'>
      {/* Animated dot-matrix terminal wash, masked to the upper-right space. */}
      <NothingBackground
        className='absolute inset-0 [mask-image:radial-gradient(ellipse_90%_70%_at_60%_35%,black,transparent)]'
      />

      <LandingHeader />

      <main className='relative h-full w-full'>
        {scenes.map((scene, i) => (
          <section
            key={i}
            ref={registerScene(i)}
            className='nd-scene'
            data-active={i === current}
          >
            {scene}
          </section>
        ))}
      </main>

      <SceneProgress current={current} onSelect={goto} />
    </div>
  )
}
