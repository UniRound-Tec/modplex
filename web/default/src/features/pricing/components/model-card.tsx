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
import { memo } from 'react'
import { ArrowUpRight, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatTokens } from '@/features/rankings/lib/format'
import { DEFAULT_TOKEN_UNIT } from '../constants'
import {
  getDynamicDisplayGroupRatio,
  getDynamicPricingSummary,
} from '../lib/dynamic-price'
import { parseTags } from '../lib/filters'
import { isTokenBasedModel } from '../lib/model-helpers'
import { formatPrice, formatRequestPrice } from '../lib/price'
import type { Modality, PricingModel, TokenUnit } from '../types'
import { ModelPerfBadge, type ModelPerfBadgeData } from './model-perf-badge'

export interface ModelCardProps {
  model: PricingModel
  onClick: () => void
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
  perf?: ModelPerfBadgeData
}

/** Single-letter glyphs for input modalities — Space Mono, like a test card. */
const MODALITY_GLYPH: Record<Modality, string> = {
  text: 'T',
  image: 'I',
  audio: 'A',
  video: 'V',
  file: 'F',
}

export const ModelCard = memo(function ModelCard(props: ModelCardProps) {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const tokenUnit = props.tokenUnit ?? DEFAULT_TOKEN_UNIT
  const priceRate = props.priceRate ?? 1
  const usdExchangeRate = props.usdExchangeRate ?? 1
  const showRechargePrice = props.showRechargePrice ?? false
  const isTokenBased = isTokenBasedModel(props.model)
  const tokenUnitLabel = tokenUnit === 'K' ? '/1K' : '/1M'
  const tags = parseTags(props.model.tags)
  const groups = props.model.enable_groups || []
  const modalities = props.model.input_modalities || []

  const modelIconKey = props.model.icon || props.model.vendor_icon
  const modelIcon = modelIconKey ? getLobeIcon(modelIconKey, 22) : null
  const initial = props.model.model_name?.charAt(0).toUpperCase() || '?'
  const hasAlias =
    !!props.model.display_name &&
    props.model.display_name !== props.model.model_name

  const isDynamicPricing =
    props.model.billing_mode === 'tiered_expr' &&
    Boolean(props.model.billing_expr)
  const dynamicSummary = isDynamicPricing
    ? getDynamicPricingSummary(props.model, {
        tokenUnit,
        showRechargePrice,
        priceRate,
        usdExchangeRate,
        groupRatioMultiplier: getDynamicDisplayGroupRatio(props.model),
      })
    : null

  const vendorName = props.model.vendor_name
  const primaryTag = tags[0]
  const restTagCount = Math.max(tags.length - 1, 0)
  const hasUsage =
    props.model.usage_tokens != null && props.model.usage_tokens > 0

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(props.model.model_name || '')
  }

  // Right-hand price column: two stacked instrument readings (IN / OUT), or a
  // single per-request / dynamic reading. Mono + tabular for aligned figures.
  const priceColumn = dynamicSummary ? (
    dynamicSummary.isSpecialExpression ? (
      <span className='text-warning nd-meta text-xs'>
        {t('Special billing expression')}
      </span>
    ) : (
      <PriceLine
        label={t('Dynamic Pricing')}
        value={
          dynamicSummary.primaryEntries[0]?.formatted ?? t('Dynamic Pricing')
        }
        unit={dynamicSummary.primaryEntries.length ? tokenUnitLabel : undefined}
      />
    )
  ) : isTokenBased ? (
    <div className='flex flex-col items-end gap-1'>
      <PriceLine
        label={t('Input')}
        value={formatPrice(
          props.model,
          'input',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        )}
        unit={tokenUnitLabel}
      />
      <PriceLine
        label={t('Output')}
        value={formatPrice(
          props.model,
          'output',
          tokenUnit,
          showRechargePrice,
          priceRate,
          usdExchangeRate
        )}
        unit={tokenUnitLabel}
      />
    </div>
  ) : (
    <PriceLine
      label={t('request')}
      value={formatRequestPrice(
        props.model,
        showRechargePrice,
        priceRate,
        usdExchangeRate
      )}
    />
  )

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          props.onClick()
        }
      }}
      className={cn(
        // Hover-driven feedback (subtle scale-up), no click/press animation.
        // `active:transform-none!` overrides the global `[role=button]:active`
        // scale-down so clicking doesn't shrink the card.
        'group hover:bg-muted/40 relative flex cursor-pointer gap-4 px-3 py-4 outline-none transition-[background-color,transform,scale] duration-200 ease-out will-change-transform hover:scale-[1.01] active:transform-none! sm:px-4',
        'focus-visible:bg-muted/40'
      )}
    >
      {/* Icon — colored brand glyph in a sharp bordered cell. */}
      <div className='border-border bg-background flex size-10 shrink-0 items-center justify-center border'>
        {modelIcon || (
          <span className='nd-meta text-muted-foreground text-sm font-bold'>
            {initial}
          </span>
        )}
      </div>

      <div className='min-w-0 flex-1'>
        {/* Title row: name + modality glyphs ......... price column */}
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
              <h3
                className={cn(
                  'text-foreground truncate text-[15px] leading-tight font-bold',
                  hasAlias ? '' : 'nd-meta'
                )}
              >
                {props.model.display_name || props.model.model_name}
              </h3>
              {modalities.length > 0 && (
                <span className='flex items-center gap-1'>
                  {modalities.map((m) => (
                    <span
                      key={m}
                      title={m}
                      className='border-border text-muted-foreground nd-meta flex size-4 items-center justify-center border text-[9px] leading-none'
                    >
                      {MODALITY_GLYPH[m] ?? m.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </span>
              )}
              {primaryTag && (
                <span className='nd-eyebrow flex items-center gap-1.5 text-[10px]'>
                  <span
                    aria-hidden
                    className='bg-foreground/50 size-1.5 rounded-full'
                  />
                  {primaryTag}
                  {restTagCount > 0 && (
                    <span className='text-muted-foreground/60'>
                      +{restTagCount}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Description — sits directly under the name, up to 3 lines. */}
            <p className='text-muted-foreground mt-2 line-clamp-2 min-h-[2.6rem] text-[13px] leading-relaxed break-words [overflow-wrap:anywhere]'>
              {props.model.description || t('No description available.')}
            </p>
          </div>

          <div className='flex shrink-0 items-start gap-1'>
            <div className='flex flex-col items-end gap-1'>
              {priceColumn}
              {hasUsage && (
                <span className='nd-meta text-muted-foreground/50 text-[10px] whitespace-nowrap'>
                  {formatTokens(props.model.usage_tokens as number)}{' '}
                  {t('tokens')}
                </span>
              )}
            </div>
            <button
              type='button'
              onClick={handleCopy}
              title={t('Copy model name')}
              className='text-muted-foreground/50 hover:text-foreground hover:bg-muted -mr-1 ml-1 hidden rounded-none p-1 opacity-0 transition group-hover:opacity-100 sm:block'
            >
              <Copy className='size-3.5' />
            </button>
          </div>
        </div>

        {/* Footer — mono instrument metadata, far edges anchored. */}
        <div className='mt-3 flex items-center justify-between gap-3'>
          <div className='nd-meta text-muted-foreground/70 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]'>
            {vendorName && (
              <span className='truncate'>
                {t('by')} {vendorName}
              </span>
            )}
            {groups[0] && (
              <>
                <Dot />
                <span className='truncate'>{groups[0]}</span>
              </>
            )}
            <Dot />
            <span>{isTokenBased ? t('Token-based') : t('Per Request')}</span>
            {isDynamicPricing && (
              <>
                <Dot />
                <span className='text-warning'>{t('Dynamic Pricing')}</span>
              </>
            )}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <ModelPerfBadge perf={props.perf} />
            <span className='nd-meta text-muted-foreground/40 hidden items-center gap-1 text-[11px] transition-colors group-hover:text-foreground sm:flex'>
              {t('Details')}
              <ArrowUpRight className='size-3' />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

function Dot() {
  return <span aria-hidden className='text-muted-foreground/30'>·</span>
}

function PriceLine(props: { label: string; value: string; unit?: string }) {
  return (
    <div className='flex items-baseline gap-1.5 whitespace-nowrap'>
      <span className='nd-eyebrow text-[9px]'>{props.label}</span>
      <span className='nd-meta text-foreground text-sm font-bold'>
        {props.value}
      </span>
      {props.unit && (
        <span className='nd-meta text-muted-foreground/50 text-[10px]'>
          {props.unit}
        </span>
      )}
    </div>
  )
}
