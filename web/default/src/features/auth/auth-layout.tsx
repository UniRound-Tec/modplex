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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

type AuthLayoutProps = {
  children: React.ReactNode
}

/** Display brand — see the Modplex landing. The QuantumNous / New API
 *  attribution is preserved in the panel footer (project policy, Rule 5). */
const BRAND = 'Modplex'

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <div className='modplex-auth flex h-svh w-full items-center justify-center overflow-hidden bg-[var(--nd-bg)]'>
      {/* Max-width shell — prevents the layout from stretching too wide on
          ultra-wide monitors while keeping it full-bleed on smaller screens. */}
      <div className='relative grid h-svh w-full max-w-[1440px] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1fr]'>
        {/* Brand context — the one Doto moment, confidently empty. Hidden on
            narrow screens where the form takes the whole canvas. */}
        <aside className='relative hidden flex-col justify-between overflow-hidden border-r border-[var(--nd-border-visible)] p-12 lg:flex xl:p-16'>
          {/* Dot grid — subtle static texture */}
          <div
            aria-hidden
            className='nd-dot-grid-subtle pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]'
          />

          {/* Glyph — animated concentric arcs, Nothing Phone inspired */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 flex items-center justify-center'
          >
            <div className='nd-glyph-container'>
              <div className='nd-glyph-ring nd-glyph-ring-1' />
              <div className='nd-glyph-ring nd-glyph-ring-2' />
              <div className='nd-glyph-ring nd-glyph-ring-3' />
              <div className='nd-glyph-dot' />
            </div>
          </div>

          <Link
            to='/'
            className='relative flex items-center gap-2.5'
            aria-label={BRAND}
          >
            <span className='size-2.5 bg-[var(--nd-accent)] nd-auth-accent-pulse' />
            <span className='nd-label'>{BRAND} / ACCESS</span>
          </Link>

          <div className='relative'>
            <h1 className='nd-display' style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
              {BRAND}
            </h1>
            <p className='mt-6 max-w-xs text-[15px] leading-relaxed text-[var(--nd-text-secondary)]'>
              {t('Unified API Gateway')} — {t('One API. Every model.')}
            </p>
          </div>

          {/* Project attribution — preserved per project policy (Rule 5). */}
          <p className='nd-mono relative text-[11px] tracking-wide text-[var(--nd-text-disabled)]'>
            &copy; {year}{' '}
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--nd-text-secondary)] transition-colors duration-200 hover:text-[var(--nd-text-display)]'
            >
              {t('New API')}
            </a>
            . {t('footer.newapi.projectAttributionSuffix')}
          </p>
        </aside>

      {/* Form column. */}
      <main className='relative overflow-y-auto'>
        {/* Compact wordmark when the brand panel is hidden. */}
        <Link
          to='/'
          className='absolute top-6 left-6 z-10 flex items-center gap-2.5 sm:top-8 sm:left-8 lg:hidden'
          aria-label={BRAND}
        >
          <span className='size-2.5 bg-[var(--nd-accent)]' />
          <span className='text-[15px] font-medium tracking-tight text-[var(--nd-text-display)]'>
            {BRAND}
          </span>
        </Link>

        <Link
          to='/'
          className='nd-label absolute top-8 right-8 z-10 hidden text-[var(--nd-text-secondary)] transition-colors duration-200 hover:text-[var(--nd-text-display)] lg:block'
        >
          {t('Home')} ↗
        </Link>

        <div className='flex min-h-full items-center justify-center px-6 py-20 sm:px-10'>
          <div className='w-full max-w-[400px]'>{children}</div>
        </div>
      </main>
      </div>
    </div>
  )
}
