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
import { useTranslation } from 'react-i18next'
import { CtaButtons } from '../cta-buttons'
import { SceneFrame } from './scene-frame'

export function SceneStart({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <SceneFrame index={4} label='Start'>
      <div className='max-w-4xl'>
        {/* Latin dot-matrix display — see SceneHero note. */}
        <h2
          data-stagger
          className='nd-display'
          style={{ fontSize: 'clamp(2.75rem, 10vw, 7.5rem)' }}
        >
          Start building.
        </h2>
        <p
          data-stagger
          className='mt-7 max-w-lg text-[15px] leading-relaxed text-[var(--nd-text-secondary)] md:text-base'
        >
          {t('One key. One endpoint. Every model you ship with.')}
        </p>

        <div data-stagger className='mt-10'>
          <CtaButtons isAuthenticated={isAuthenticated} />
        </div>
      </div>

      {/* Project attribution — preserved per project policy (Rule 5). */}
      <div
        data-stagger
        className='nd-mono mt-16 border-t border-[var(--nd-border)] pt-6 text-[11px] text-[var(--nd-text-disabled)]'
      >
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
      </div>
    </SceneFrame>
  )
}
