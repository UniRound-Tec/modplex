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
import {
  combineBillingExpr,
  splitBillingExprAndRequestRules,
} from '@/features/pricing/lib/billing-expr'
import { safeJsonParse } from '@/features/system-settings/utils/json-parser'
import type { ModelRatioData } from './model-pricing-sheet'

// ---------------------------------------------------------------------------
// Shared per-model pricing <-> option-map logic.
//
// A model's pricing is scattered across ten JSON option maps (ModelRatio,
// CompletionRatio, ...). Both the ratio-settings visual editor and the model
// management page edit that pricing through `ModelPricingSheet`, so the read
// (option maps -> ModelRatioData) and write (ModelRatioData -> option maps)
// live here as the single source of truth. Keeping them together guarantees
// the two entry points can never drift in field coverage or semantics.
// ---------------------------------------------------------------------------

export const PRICING_OPTION_KEYS = [
  'ModelPrice',
  'ModelRatio',
  'CacheRatio',
  'CreateCacheRatio',
  'CompletionRatio',
  'ImageRatio',
  'AudioRatio',
  'AudioCompletionRatio',
  'billing_setting.billing_mode',
  'billing_setting.billing_expr',
] as const

export type PricingOptionKey = (typeof PRICING_OPTION_KEYS)[number]

/** Raw JSON strings for each pricing option, as stored in system settings. */
export type PricingOptionSource = Partial<Record<PricingOptionKey, string>>

type NumberMap = Record<string, number>
type StringMap = Record<string, string>

function parseNumberMap(raw?: string): NumberMap {
  return safeJsonParse<NumberMap>(raw ?? '', { fallback: {}, silent: true })
}

function parseStringMap(raw?: string): StringMap {
  return safeJsonParse<StringMap>(raw ?? '', { fallback: {}, silent: true })
}

/**
 * Build the `ModelPricingSheet` edit payload for a single model by reading its
 * entry out of every pricing option map. Returns an all-empty payload (still a
 * valid per-token config) when the model has no pricing configured yet.
 */
export function buildPricingEditData(
  source: PricingOptionSource,
  name: string
): ModelRatioData {
  const priceMap = parseNumberMap(source['ModelPrice'])
  const ratioMap = parseNumberMap(source['ModelRatio'])
  const cacheMap = parseNumberMap(source['CacheRatio'])
  const createCacheMap = parseNumberMap(source['CreateCacheRatio'])
  const completionMap = parseNumberMap(source['CompletionRatio'])
  const imageMap = parseNumberMap(source['ImageRatio'])
  const audioMap = parseNumberMap(source['AudioRatio'])
  const audioCompletionMap = parseNumberMap(source['AudioCompletionRatio'])
  const billingModeMap = parseStringMap(source['billing_setting.billing_mode'])
  const billingExprMap = parseStringMap(source['billing_setting.billing_expr'])

  const str = (map: NumberMap) =>
    map[name] !== undefined ? map[name].toString() : ''

  const price = str(priceMap)
  const base: ModelRatioData = {
    name,
    price,
    ratio: str(ratioMap),
    cacheRatio: str(cacheMap),
    createCacheRatio: str(createCacheMap),
    completionRatio: str(completionMap),
    imageRatio: str(imageMap),
    audioRatio: str(audioMap),
    audioCompletionRatio: str(audioCompletionMap),
  }

  if (billingModeMap[name] === 'tiered_expr') {
    const { billingExpr, requestRuleExpr } = splitBillingExprAndRequestRules(
      billingExprMap[name] || ''
    )
    return { ...base, billingMode: 'tiered_expr', billingExpr, requestRuleExpr }
  }

  return { ...base, billingMode: price !== '' ? 'per-request' : 'per-token' }
}

/**
 * Apply a saved `ModelRatioData` to the pricing option maps for one or more
 * target model names. Each target is first cleared from every map, then only
 * the fields relevant to the chosen billing mode are written back, so switching
 * modes or clearing lanes never leaves stale entries. Returns the updated,
 * pretty-printed JSON string for every pricing option key.
 */
export function applyPricingToMaps(
  source: PricingOptionSource,
  data: ModelRatioData,
  targetNames: string[] = [data.name]
): Record<PricingOptionKey, string> {
  const priceMap = parseNumberMap(source['ModelPrice'])
  const ratioMap = parseNumberMap(source['ModelRatio'])
  const cacheMap = parseNumberMap(source['CacheRatio'])
  const createCacheMap = parseNumberMap(source['CreateCacheRatio'])
  const completionMap = parseNumberMap(source['CompletionRatio'])
  const imageMap = parseNumberMap(source['ImageRatio'])
  const audioMap = parseNumberMap(source['AudioRatio'])
  const audioCompletionMap = parseNumberMap(source['AudioCompletionRatio'])
  const billingModeMap = parseStringMap(source['billing_setting.billing_mode'])
  const billingExprMap = parseStringMap(source['billing_setting.billing_expr'])

  const setIfPresent = (
    target: NumberMap,
    name: string,
    value: string | undefined
  ) => {
    if (!value || value === '') return
    const parsed = parseFloat(value)
    if (Number.isFinite(parsed)) target[name] = parsed
  }

  targetNames.forEach((name) => {
    delete priceMap[name]
    delete ratioMap[name]
    delete cacheMap[name]
    delete createCacheMap[name]
    delete completionMap[name]
    delete imageMap[name]
    delete audioMap[name]
    delete audioCompletionMap[name]
    delete billingModeMap[name]
    delete billingExprMap[name]

    if (data.billingMode === 'tiered_expr') {
      const combined = combineBillingExpr(
        data.billingExpr || '',
        data.requestRuleExpr || ''
      )
      if (combined) {
        billingModeMap[name] = 'tiered_expr'
        billingExprMap[name] = combined
      }
      // Always serialize ratio/price values for tiered_expr models so they
      // serve as fallback during multi-instance sync delays. The backend's
      // ModelPriceHelper checks billing_mode first, so these values are only
      // consulted when billing_setting hasn't propagated yet.
      setIfPresent(priceMap, name, data.price)
      setIfPresent(ratioMap, name, data.ratio)
      setIfPresent(cacheMap, name, data.cacheRatio)
      setIfPresent(createCacheMap, name, data.createCacheRatio)
      setIfPresent(completionMap, name, data.completionRatio)
      setIfPresent(imageMap, name, data.imageRatio)
      setIfPresent(audioMap, name, data.audioRatio)
      setIfPresent(audioCompletionMap, name, data.audioCompletionRatio)
    } else if (data.price && data.price !== '') {
      setIfPresent(priceMap, name, data.price)
    } else {
      setIfPresent(ratioMap, name, data.ratio)
      setIfPresent(cacheMap, name, data.cacheRatio)
      setIfPresent(createCacheMap, name, data.createCacheRatio)
      setIfPresent(completionMap, name, data.completionRatio)
      setIfPresent(imageMap, name, data.imageRatio)
      setIfPresent(audioMap, name, data.audioRatio)
      setIfPresent(audioCompletionMap, name, data.audioCompletionRatio)
    }
  })

  return {
    ModelPrice: JSON.stringify(priceMap, null, 2),
    ModelRatio: JSON.stringify(ratioMap, null, 2),
    CacheRatio: JSON.stringify(cacheMap, null, 2),
    CreateCacheRatio: JSON.stringify(createCacheMap, null, 2),
    CompletionRatio: JSON.stringify(completionMap, null, 2),
    ImageRatio: JSON.stringify(imageMap, null, 2),
    AudioRatio: JSON.stringify(audioMap, null, 2),
    AudioCompletionRatio: JSON.stringify(audioCompletionMap, null, 2),
    'billing_setting.billing_mode': JSON.stringify(billingModeMap, null, 2),
    'billing_setting.billing_expr': JSON.stringify(billingExprMap, null, 2),
  }
}
