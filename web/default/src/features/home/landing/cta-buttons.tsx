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
import { useStatus } from '@/hooks/use-status'

const LABEL = 'nd-mono text-[11px] uppercase tracking-[0.14em]'
const PRIMARY = `inline-flex h-11 items-center gap-2 bg-[var(--nd-text-display)] px-6 text-[var(--nd-bg)] transition-opacity duration-200 hover:opacity-90 ${LABEL}`
const SECONDARY = `inline-flex h-11 items-center border border-[var(--nd-border-visible)] px-6 text-[var(--nd-text-primary)] transition-colors duration-200 hover:border-[var(--nd-text-display)] hover:text-[var(--nd-text-display)] ${LABEL}`
const GHOST = `inline-flex h-11 items-center gap-1.5 px-2 text-[var(--nd-text-secondary)] transition-colors duration-200 hover:text-[var(--nd-text-display)] ${LABEL}`

/** Primary entry actions, shared by the hero and the closing scene so users
 *  can act from the first screen without paging to the end. */
export function CtaButtons({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {isAuthenticated ? (
        <Link to='/dashboard' className={PRIMARY}>
          {t('Go to Dashboard')}
          <span aria-hidden>→</span>
        </Link>
      ) : (
        <Link to='/sign-up' className={PRIMARY}>
          {t('Get Started')}
          <span aria-hidden>→</span>
        </Link>
      )}

      <Link to='/pricing' className={SECONDARY}>
        {t('View Pricing')}
      </Link>

      <a
        href={docsUrl}
        target='_blank'
        rel='noopener noreferrer'
        className={GHOST}
      >
        {t('Docs')}
        <span aria-hidden>↗</span>
      </a>
    </div>
  )
}
