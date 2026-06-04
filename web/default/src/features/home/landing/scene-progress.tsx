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
import { cn } from '@/lib/utils'
import { SCENES } from './landing-constants'

interface SceneProgressProps {
  current: number
  onSelect: (index: number) => void
}

/**
 * Edge-anchored progress rail. The active marker is the single red signal on
 * the screen — it both decorates and encodes "where you are".
 */
export function SceneProgress({ current, onSelect }: SceneProgressProps) {
  const { t } = useTranslation()

  return (
    <div className='pointer-events-auto absolute top-1/2 right-5 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex'>
      {SCENES.map((scene, i) => {
        const active = i === current
        return (
          <button
            key={scene.id}
            type='button'
            onClick={() => onSelect(i)}
            className='group flex items-center gap-3'
            aria-label={t(scene.label)}
            aria-current={active}
          >
            {/* Only the active scene shows its label — keeps the rail a quiet
                instrument, never competing with scene content. */}
            <span className='nd-label text-[var(--nd-text-secondary)]'>
              {active ? t(scene.label) : ''}
            </span>
            <span
              className={cn(
                'h-px transition-all duration-300',
                active
                  ? 'w-8 bg-[var(--nd-accent)]'
                  : 'w-4 bg-[var(--nd-border-visible)] group-hover:w-6 group-hover:bg-[var(--nd-text-secondary)]'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
