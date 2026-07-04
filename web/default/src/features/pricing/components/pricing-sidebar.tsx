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
import type { ComponentType, ReactNode } from 'react'
import { ChevronDown, Layers, RotateCcw, Tag, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FILTER_ALL } from '../constants'
import { parseTags } from '../lib/filters'
import type { PricingModel, PricingVendor } from '../types'

type FilterOption = {
  value: string
  label: string
  count?: number
  suffix?: string
  icon?: ReactNode
}

type FilterSectionProps = {
  title: string
  icon: ComponentType<{ className?: string }>
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

export interface PricingSidebarProps {
  vendorFilter: string
  groupFilter: string
  tagFilter: string
  onVendorChange: (value: string) => void
  onGroupChange: (value: string) => void
  onTagChange: (value: string) => void
  vendors: PricingVendor[]
  groups: string[]
  groupRatios?: Record<string, number>
  tags: string[]
  models: PricingModel[]
  hasActiveFilters: boolean
  onClearFilters: () => void
  className?: string
}

function countBy(
  models: PricingModel[],
  predicate: (model: PricingModel) => boolean
): number {
  return models.reduce((count, model) => count + (predicate(model) ? 1 : 0), 0)
}

function formatGroupRatio(ratio: number | undefined): string | undefined {
  if (ratio == null) return undefined
  const formatted = Number.isInteger(ratio)
    ? ratio.toString()
    : ratio.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `x${formatted}`
}

/** One filter option per row — full-width list, not a wrapped chip cloud. */
function FilterRow(props: {
  option: FilterOption
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={props.onClick}
      className={cn(
        'group flex w-full items-center justify-between gap-2 border px-2 py-1.5 text-xs font-medium transition-colors',
        props.active
          ? 'border-foreground bg-foreground text-background'
          : 'text-muted-foreground hover:border-foreground/40 hover:text-foreground border-transparent'
      )}
      title={props.option.label}
    >
      <span className='flex min-w-0 items-center gap-1.5'>
        {props.option.icon && (
          <span className='shrink-0'>{props.option.icon}</span>
        )}
        <span className='truncate'>{props.option.label}</span>
      </span>
      {(props.option.suffix || props.option.count != null) && (
        <span
          className={cn(
            'nd-meta shrink-0 text-[10px]',
            props.active ? 'text-background/70' : 'text-muted-foreground/60'
          )}
        >
          {props.option.suffix ?? props.option.count}
        </span>
      )}
    </button>
  )
}

function FilterSection(props: FilterSectionProps) {
  const Icon = props.icon
  return (
    <Collapsible
      defaultOpen
      className='border-border border-b py-1 last:border-b-0'
    >
      <CollapsibleTrigger className='group flex w-full items-center justify-between gap-2 py-3 text-left'>
        <span className='flex items-center gap-2.5'>
          <Icon className='text-muted-foreground size-4 shrink-0' />
          <span className='text-foreground text-sm font-medium'>
            {props.title}
          </span>
        </span>
        <ChevronDown className='text-muted-foreground/60 size-4 transition-transform group-data-[panel-open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent className='CollapsibleContent'>
        <div className='flex flex-col gap-0.5 pb-3'>
          {props.options.map((option) => (
            <FilterRow
              key={option.value}
              option={option}
              active={props.value === option.value}
              onClick={() => props.onChange(option.value)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function PricingSidebar(props: PricingSidebarProps) {
  const { t } = useTranslation()

  const vendorOptions: FilterOption[] = [
    {
      value: FILTER_ALL,
      label: t('All Vendors'),
      count: props.models.length,
    },
    ...props.vendors
      .map((vendor) => ({
        value: vendor.name,
        label: vendor.name,
        count: countBy(
          props.models,
          (model) => model.vendor_name === vendor.name
        ),
        icon: vendor.icon ? getLobeIcon(vendor.icon, 14) : undefined,
      }))
      .filter((vendor) => vendor.count > 0),
  ]

  const groupOptions: FilterOption[] = [
    {
      value: FILTER_ALL,
      label: t('All Groups'),
    },
    ...props.groups.map((group) => ({
      value: group,
      label: group,
      suffix: formatGroupRatio(props.groupRatios?.[group]),
    })),
  ]

  const tagOptions: FilterOption[] = [
    {
      value: FILTER_ALL,
      label: t('All Tags'),
      count: props.models.length,
    },
    ...props.tags.map((tag) => ({
      value: tag,
      label: tag,
      count: countBy(props.models, (model) =>
        parseTags(model.tags)
          .map((item) => item.toLowerCase())
          .includes(tag.toLowerCase())
      ),
    })),
  ]

  return (
    <aside className={cn(props.className)}>
      <div className='border-border flex items-center justify-between gap-2 border-b pb-3'>
        <div className='flex items-baseline gap-2'>
          <h2 className='nd-eyebrow text-foreground text-[11px]'>
            {t('Filter')}
          </h2>
          {props.hasActiveFilters && (
            <span aria-hidden className='bg-accent size-1.5 rounded-full' />
          )}
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={props.onClearFilters}
          disabled={!props.hasActiveFilters}
          className='nd-meta h-7 gap-1.5 px-2 text-[11px]'
        >
          <RotateCcw className='size-3.5' />
          {t('Reset')}
        </Button>
      </div>

      <div>
        <FilterSection
          title={t('Groups')}
          icon={Layers}
          value={props.groupFilter}
          options={groupOptions}
          onChange={props.onGroupChange}
        />
        <FilterSection
          title={t('All Vendors')}
          icon={Building2}
          value={props.vendorFilter}
          options={vendorOptions}
          onChange={props.onVendorChange}
        />
        <FilterSection
          title={t('Model Tags')}
          icon={Tag}
          value={props.tagFilter}
          options={tagOptions}
          onChange={props.onTagChange}
        />
      </div>
    </aside>
  )
}
