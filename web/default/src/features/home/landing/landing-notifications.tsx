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
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@/hooks/use-notifications'
import { formatDateTimeObject } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/ui/markdown'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LANDING_ICON_BTN } from './landing-controls'

interface AnnouncementItem {
  content?: string
  extra?: string
  publishDate?: string | Date
}

const TAB_BTN =
  'nd-mono flex-1 border-b-2 px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200'

function EmptyLine({ label }: { label: string }) {
  return (
    <div className='nd-mono px-4 py-10 text-center text-[11px] tracking-[0.14em] text-[var(--nd-text-disabled)]'>
      [ {label} ]
    </div>
  )
}

/**
 * Notification center, rebuilt in the Nothing idiom: sharp corners, flat
 * monochrome surface, Space Mono tabs. The unread dot and the active-tab
 * underline are the screen's one red signal — attention, now.
 */
export function LandingNotifications() {
  const { t } = useTranslation()
  const n = useNotifications()

  return (
    <Popover open={n.popoverOpen} onOpenChange={n.setPopoverOpen}>
      <PopoverTrigger
        className={LANDING_ICON_BTN}
        aria-label={t('Notifications')}
      >
        <span className='relative flex'>
          <Bell className='size-4' strokeWidth={1.5} />
          {n.unreadCount > 0 ? (
            <span className='absolute -right-1 -top-1 size-1.5 bg-[var(--nd-accent)]' />
          ) : null}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={12}
        className='nd-scope w-[min(24rem,calc(100vw-1.5rem))] gap-0 rounded-none border border-[var(--nd-border-visible)] bg-[var(--nd-surface)] p-0 text-[var(--nd-text-primary)] shadow-none ring-0'
      >
        <div className='flex items-center justify-between border-b border-[var(--nd-border)] px-4 py-3'>
          <span className='nd-label'>{t('System Announcements')}</span>
          <span className='nd-mono text-[10px] tracking-[0.14em] text-[var(--nd-text-disabled)]'>
            {n.unreadCount > 0 ? `${n.unreadCount} NEW` : 'CLEAR'}
          </span>
        </div>

        <div className='flex'>
          {(['notice', 'announcements'] as const).map((tab) => {
            const active = n.activeTab === tab
            return (
              <button
                key={tab}
                type='button'
                onClick={() => n.setActiveTab(tab)}
                className={cn(
                  TAB_BTN,
                  active
                    ? 'border-[var(--nd-accent)] text-[var(--nd-text-display)]'
                    : 'border-transparent text-[var(--nd-text-secondary)] hover:text-[var(--nd-text-display)]'
                )}
              >
                {tab === 'notice' ? t('Notice') : t('Timeline')}
              </button>
            )
          })}
        </div>

        <div className='max-h-[min(52vh,26rem)] overflow-y-auto px-4 py-3 text-sm'>
          {n.loading ? (
            <EmptyLine label='LOADING...' />
          ) : n.activeTab === 'notice' ? (
            n.notice ? (
              <Markdown>{n.notice}</Markdown>
            ) : (
              <EmptyLine label={t('No announcements at this time')} />
            )
          ) : n.announcements.length > 0 ? (
            <div className='flex flex-col'>
              {(n.announcements as AnnouncementItem[]).map((item, i) => {
                const date = item.publishDate ? new Date(item.publishDate) : null
                return (
                  <div
                    key={i}
                    className='border-b border-[var(--nd-border)] py-3 last:border-b-0'
                  >
                    <div className='flex gap-3'>
                      <span className='mt-1.5 size-1.5 shrink-0 bg-[var(--nd-text-disabled)]' />
                      <div className='min-w-0 flex-1'>
                        <Markdown>{item.content || ''}</Markdown>
                        {date ? (
                          <div className='nd-mono mt-1.5 text-[10px] tracking-wide text-[var(--nd-text-disabled)]'>
                            {formatDateTimeObject(date)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyLine label={t('No system announcements')} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
