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
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { formatNumber, formatQuota } from '@/lib/format'
import { computeTimeRange } from '@/lib/time'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserQuotaDates } from '@/features/dashboard/api'
import { useModelStatCardsConfig } from '@/features/dashboard/hooks/use-dashboard-config'
import {
  buildQueryParams,
  calculateDashboardStats,
  getDefaultDays,
} from '@/features/dashboard/lib'
import type {
  QuotaDataItem,
  DashboardFilters,
} from '@/features/dashboard/types'

interface LogStatCardsProps {
  filters?: DashboardFilters
  onDataUpdate?: (data: QuotaDataItem[], loading: boolean) => void
}

export function LogStatCards(props: LogStatCardsProps) {
  const statCardsConfig = useModelStatCardsConfig()
  const user = useAuthStore((state) => state.auth.user)
  const isAdmin = !!(user?.role && user.role >= 10)
  const [stats, setStats] = useState<{
    totalQuota: number
    totalCount: number
    totalTokens: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [timeRangeMinutes, setTimeRangeMinutes] = useState(0)

  const { filters, onDataUpdate } = props

  useEffect(() => {
    const abortController = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    setError(false)
    onDataUpdate?.([], true)

    const timeRange = computeTimeRange(
      getDefaultDays(filters?.time_granularity),
      filters?.start_timestamp,
      filters?.end_timestamp
    )
    const timeDiff = (timeRange.end_timestamp - timeRange.start_timestamp) / 60
    setTimeRangeMinutes(timeDiff)

    getUserQuotaDates(buildQueryParams(timeRange, filters), isAdmin)
      .then((res) => {
        if (abortController.signal.aborted) return
        const data = res?.data || []
        setStats(calculateDashboardStats(data))
        onDataUpdate?.(data, false)
      })
      .catch(() => {
        if (abortController.signal.aborted) return
        setStats(null)
        setError(true)
        onDataUpdate?.([], false)
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      abortController.abort()
    }
  }, [filters, isAdmin, onDataUpdate])

  const adaptedStats = {
    rpm: stats?.totalCount ?? 0,
    quota: stats?.totalQuota ?? 0,
    tpm: stats?.totalTokens ?? 0,
  }

  const items = statCardsConfig.map((config) => ({
    title: config.title,
    value:
      config.key === 'quota'
        ? formatQuota(config.getValue(adaptedStats, timeRangeMinutes))
        : formatNumber(config.getValue(adaptedStats, timeRangeMinutes)),
    desc: config.description,
    icon: config.icon,
  }))

  return (
    <div className='overflow-hidden border'>
      <div className='divide-border grid grid-cols-2 divide-x sm:grid-cols-3 lg:grid-cols-5'>
        {items.map((it, idx) => {
          const Icon = it.icon
          return (
            <div
              key={it.title}
              className={`px-3 py-3 sm:px-5 sm:py-4 ${idx === items.length - 1 && items.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <div className='nd-label flex items-center gap-1.5 text-[10px]'>
                <Icon
                  className='size-3.5 shrink-0 opacity-60'
                  strokeWidth={1.5}
                />
                <span className='truncate'>{it.title}</span>
              </div>

              {loading ? (
                <div className='mt-2 space-y-1.5'>
                  <Skeleton className='h-7 w-20' />
                  <Skeleton className='h-3.5 w-28' />
                </div>
              ) : error ? (
                <>
                  <div className='nd-meta text-muted-foreground mt-2 text-xl break-all sm:text-2xl'>
                    --
                  </div>
                  <div className='text-muted-foreground/50 mt-1 hidden text-[11px] md:block'>
                    {it.desc}
                  </div>
                </>
              ) : (
                <>
                  <div className='nd-meta text-foreground mt-2 text-xl break-all sm:text-2xl'>
                    {it.value}
                  </div>
                  <div className='text-muted-foreground/60 mt-1 hidden text-[11px] md:block'>
                    {it.desc}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
