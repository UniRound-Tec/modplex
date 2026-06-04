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
import { FLOW_STEPS } from '../landing-constants'
import { SceneFrame } from './scene-frame'

export function SceneFlow() {
  const { t } = useTranslation()

  return (
    <SceneFrame index={3} label='Flow'>
      <h2
        data-stagger
        className='mb-12 max-w-2xl text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-[var(--nd-text-display)]'
      >
        {t('How a request moves.')}
      </h2>

      <div className='grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3'>
        {FLOW_STEPS.map((step, i) => (
          <div key={step.index} data-stagger className='relative'>
            <div className='flex items-center gap-4'>
              <span
                className='nd-mono leading-none font-bold text-[var(--nd-text-display)]'
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                {step.index}
              </span>
              {i < FLOW_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className='nd-mono hidden flex-1 text-right text-2xl text-[var(--nd-border-visible)] md:block'
                >
                  →
                </span>
              )}
            </div>
            <h3 className='mt-5 text-lg font-medium text-[var(--nd-text-display)]'>
              {t(step.title)}
            </h3>
            <p className='mt-2 max-w-xs text-sm leading-relaxed text-[var(--nd-text-secondary)]'>
              {t(step.description)}
            </p>
          </div>
        ))}
      </div>
    </SceneFrame>
  )
}
