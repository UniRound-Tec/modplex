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
import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  LandingLangMenu,
  LandingThemeToggle,
} from '@/features/home/landing/landing-controls'
import { LandingNotifications } from '@/features/home/landing/landing-notifications'
import { LandingProfile } from '@/features/home/landing/landing-profile'
import { defaultTopNavLinks } from '../config/top-nav.config'
import { type TopNavLink } from '../types'

/**
 * Console application header — rebuilt in the nothing-design idiom, aligned
 * with the landing / pricing chrome.
 *
 * The whole bar is wrapped in `.modplex-console`, the token-remap scope that
 * rewrites the app's theme + sidebar tokens to the monochrome `--nd-*`
 * palette (radius 0), so every child primitive (sidebar trigger, search,
 * dropdowns) renders sharp and black-and-white. The right cluster reuses the
 * landing's self-contained instruments (language / theme / notifications /
 * profile) so the console matches the public site exactly.
 *
 * Note: the legacy theme/preset/layout customizer (`ConfigDrawer`) is
 * intentionally removed — the console keeps only the black-and-white theme.
 */
type AppHeaderProps = {
  /** Custom navigation links; defaults to backend-driven links. */
  navLinks?: TopNavLink[]
  /** Whether to show the top navigation links. @default true */
  showTopNav?: boolean
  /** Whether to show the command-palette search. @default true */
  showSearch?: boolean
  /** Whether to show the language switcher. @default true */
  showLanguageSwitcher?: boolean
  /** Whether to show the light/dark toggle. @default true */
  showThemeSwitch?: boolean
  /** Whether to show the notification button. @default true */
  showNotifications?: boolean
  /** Whether to show the profile control. @default true */
  showProfileDropdown?: boolean
}

export function AppHeader({
  navLinks = defaultTopNavLinks,
  showTopNav = true,
  showSearch = true,
  showLanguageSwitcher = true,
  showThemeSwitch = true,
  showNotifications = true,
  showProfileDropdown = true,
}: AppHeaderProps) {
  const { t } = useTranslation()
  const dynamicLinks = useTopNavLinks()
  const links = dynamicLinks.length > 0 ? dynamicLinks : navLinks
  const { systemName, loading } = useSystemConfig()
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })

  return (
    <header className='modplex-console border-border bg-background text-foreground sticky top-0 z-40 h-[var(--app-header-height,3rem)] w-full shrink-0 border-b'>
      <div className='flex h-full items-center gap-2 px-2 sm:px-3'>
        <SidebarTrigger
          variant='ghost'
          className='size-8 rounded-none text-[var(--nd-text-secondary)] hover:bg-[var(--nd-surface-raised)] hover:text-[var(--nd-text-display)]'
        />

        {/* Brand — nothing-design mark: one red square + the wordmark, exactly
            as the landing / pricing header. */}
        <Link to='/' className='group flex shrink-0 items-center gap-2.5 pe-1'>
          <span className='size-2.5 shrink-0 bg-[#d71921] transition-transform duration-300 group-hover:scale-110' />
          <span className='text-[15px] font-medium tracking-tight text-[var(--nd-text-display)]'>
            {loading ? <Skeleton className='h-4 w-16' /> : systemName}
          </span>
        </Link>

        {/* Top nav links (desktop) — Space Mono instrument links. */}
        {showTopNav && links.length > 0 && (
          <nav className='ms-2 hidden items-center lg:flex'>
            {links.map((link, i) => {
              const isActive = pathname === link.href
              // `.nd-label` sets its own color and is unlayered, so it wins
              // over plain Tailwind color utilities — the important modifier
              // (`!`) is required for the active/hover ink to actually apply.
              const linkClass = cn(
                'nd-label flex h-9 items-center px-3 transition-colors duration-200',
                isActive
                  ? 'text-[var(--nd-text-display)]!'
                  : 'text-[var(--nd-text-primary)] hover:text-[var(--nd-text-display)]!',
                link.disabled && 'pointer-events-none opacity-50'
              )
              return link.external ? (
                <a
                  key={i}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={linkClass}
                >
                  {t(link.title)}
                </a>
              ) : (
                <Link
                  key={i}
                  to={link.href}
                  disabled={link.disabled}
                  className={linkClass}
                >
                  {t(link.title)}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Instruments + account, pinned right. */}
        <div className='ms-auto flex items-center gap-1'>
          {showSearch && (
            <div className='hidden sm:block'>
              <Search />
            </div>
          )}
          {showLanguageSwitcher && <LandingLangMenu />}
          {showThemeSwitch && <LandingThemeToggle />}
          {showNotifications && <LandingNotifications />}
          {showProfileDropdown && (
            <>
              <div className='mx-1.5 h-4 w-px bg-[var(--nd-border-visible)]' />
              <LandingProfile />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
