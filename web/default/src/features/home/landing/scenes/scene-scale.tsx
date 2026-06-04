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
import { SCALE_STATS } from '../landing-constants'
import { SceneFrame } from './scene-frame'

export function SceneScale() {
  const { t } = useTranslation()
  const [hero, ...rest] = SCALE_STATS

  return (
    <SceneFrame index={2} label='Scale'>
      <div className='grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16'>
        {/* Hero metric — data as beauty */}
        <div data-stagger className='lg:col-span-7'>
          <div className='flex items-start'>
            <span
              className='nd-mono leading-[0.8] font-bold text-[var(--nd-text-display)]'
              style={{ fontSize: 'clamp(5rem, 16vw, 13rem)' }}
            >
              {hero.value}
            </span>
            <span
              className='nd-mono mt-2 text-[var(--nd-accent)]'
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
            >
              {hero.suffix}
            </span>
          </div>
          <p className='nd-label mt-2'>{t(hero.label)}</p>
        </div>

        {/* Secondary metrics — stat rows, hairline-separated */}
        <div className='lg:col-span-5'>
          {rest.map((stat) => (
            <div
              key={stat.label}
              data-stagger
              className='flex items-baseline justify-between border-t border-[var(--nd-border)] py-4'
            >
              <span className='nd-label'>{t(stat.label)}</span>
              <span className='nd-mono text-2xl font-bold text-[var(--nd-text-display)] md:text-3xl'>
                {stat.value}
                <span className='text-[var(--nd-text-disabled)]'>
                  {stat.suffix}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </SceneFrame>
  )
}
