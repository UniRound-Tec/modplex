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
import { useAuthStore } from '@/stores/auth-store'
import { BRAND_NAME } from './landing-constants'
import { LandingLangMenu, LandingThemeToggle } from './landing-controls'
import { LandingNotifications } from './landing-notifications'
import { LandingProfile } from './landing-profile'

const navLinkClass =
  'nd-label flex h-9 items-center px-3 text-[var(--nd-text-secondary)] transition-colors duration-200 hover:text-[var(--nd-text-display)]'

export function LandingHeader() {
  const { t } = useTranslation()
  const { auth } = useAuthStore()

  const isAuthenticated = !!auth.user

  return (
    <header className='pointer-events-none absolute inset-x-0 top-0 z-30'>
      <div className='relative mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-10'>
        {/* Wordmark — monochrome mark + brand. Red is reserved for the
            active progress marker (the one signal per screen). */}
        <Link
          to='/'
          className='pointer-events-auto flex items-center gap-2.5'
          aria-label={BRAND_NAME}
        >
          <span className='size-2.5 bg-[var(--nd-accent)]' />
          <span className='text-[15px] font-medium tracking-tight text-[var(--nd-text-display)]'>
            {BRAND_NAME}
          </span>
        </Link>

        {/* Primary destinations, centered on the header axis. */}
        <nav className='pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center sm:flex'>
          <Link to='/dashboard' className={navLinkClass}>
            {t('Console')}
          </Link>
          <Link to='/pricing' className={navLinkClass}>
            {t('Models')}
          </Link>
          <Link to='/docs' className={navLinkClass}>
            {t('Docs')}
          </Link>
        </nav>

        {/* Instruments + account, pinned right. */}
        <div className='pointer-events-auto flex items-center'>
          <LandingLangMenu />
          <LandingThemeToggle />
          <LandingNotifications />

          <div className='mx-2 h-4 w-px bg-[var(--nd-border-visible)]' />

          {isAuthenticated ? (
            <LandingProfile />
          ) : (
            <Link
              to='/sign-in'
              className='nd-label ml-1 flex h-9 items-center border border-[var(--nd-border-visible)] px-4 text-[var(--nd-text-primary)] transition-colors duration-200 hover:border-[var(--nd-text-display)] hover:text-[var(--nd-text-display)]'
            >
              {t('Sign in')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
