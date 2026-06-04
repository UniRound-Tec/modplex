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

export function SceneHero({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const { t } = useTranslation()

  return (
    <SceneFrame index={1} label='Index'>
      <div className='max-w-5xl'>
        <p data-stagger className='nd-label mb-7'>
          {t('Unified API Gateway')}
        </p>
        {/* Dot-matrix display stays Latin in every locale so it always
            renders in Doto (no CJK glyphs → would fall back otherwise). */}
        <h1
          data-stagger
          className='nd-display'
          style={{ fontSize: 'clamp(2.75rem, 11vw, 8.5rem)' }}
        >
          One <span className='text-[var(--nd-accent)]'>API</span>.
          <br />
          Every model.
        </h1>
        <p
          data-stagger
          className='mt-8 max-w-xl text-[15px] leading-relaxed text-[var(--nd-text-secondary)] md:text-base'
        >
          {t(
            'Access 100+ AI models through a single, OpenAI-compatible endpoint. Route, meter, and govern every request from one place.'
          )}
        </p>

        <div data-stagger className='mt-9'>
          <CtaButtons isAuthenticated={isAuthenticated} />
        </div>
      </div>

      <div
        data-stagger
        className='nd-label mt-12 flex items-center gap-3 text-[var(--nd-text-disabled)]'
      >
        <span className='animate-pulse'>↓</span>
        {t('Scroll to begin')}
      </div>
    </SceneFrame>
  )
}
