/*
Copyright (C) 2023-2026 zofar

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

For commercial licensing, please contact support@zofar.com
*/
import { useTranslation } from 'react-i18next'
import { SCENES } from '../landing-constants'

interface SceneFrameProps {
  /** 1-based scene number. */
  index: number
  /** Instrument-panel label key (resolved via t()). */
  label: string
  children: React.ReactNode
}

/**
 * Shared scene chrome: consistent padding (clears the fixed header), and the
 * tertiary "[NN / NN] — LABEL" marker that anchors every scene to the grid.
 */
export function SceneFrame({ index, label, children }: SceneFrameProps) {
  const { t } = useTranslation()
  const total = String(SCENES.length).padStart(2, '0')
  const nn = String(index).padStart(2, '0')

  return (
    <div className='relative mx-auto flex h-full w-full max-w-[1400px] flex-col pt-20 pb-9 pl-6 pr-6 md:pb-10 md:pl-10 md:pr-28 lg:pr-40'>
      <div data-stagger className='nd-label flex items-center gap-2'>
        <span className='text-[var(--nd-text-disabled)]'>
          [{nn} / {total}]
        </span>
        <span className='h-px w-6 bg-[var(--nd-border-visible)]' />
        <span>{t(label)}</span>
      </div>
      <div className='flex min-h-0 flex-1 flex-col justify-center'>
        {children}
      </div>
    </div>
  )
}
