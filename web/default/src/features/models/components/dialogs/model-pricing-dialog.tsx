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
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateSystemOption } from '@/features/system-settings/api'
import {
  useSystemOptions,
  getOptionValue,
} from '@/features/system-settings/hooks/use-system-options'
import { normalizeJsonString } from '@/features/system-settings/models/utils'
import {
  ModelPricingSheet,
  type ModelRatioData,
} from '@/features/system-settings/models/model-pricing-sheet'
import {
  PRICING_OPTION_KEYS,
  type PricingOptionKey,
  type PricingOptionSource,
  applyPricingToMaps,
  buildPricingEditData,
} from '@/features/system-settings/models/pricing-maps'
import { modelsQueryKeys } from '../../lib'

// Raw JSON defaults so getOptionValue returns each pricing map as a string.
const PRICING_OPTION_DEFAULTS: Record<PricingOptionKey, string> =
  PRICING_OPTION_KEYS.reduce(
    (acc, key) => {
      acc[key] = ''
      return acc
    },
    {} as Record<PricingOptionKey, string>
  )

type ModelPricingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelName: string
}

/**
 * Per-model pricing editor for the model management page. Reuses the canonical
 * `ModelPricingSheet` and the shared option-map helpers so its field coverage
 * and save semantics stay identical to the ratio-settings visual editor.
 */
export function ModelPricingDialog({
  open,
  onOpenChange,
  modelName,
}: ModelPricingDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: systemOptionsData } = useSystemOptions()

  const source: PricingOptionSource = useMemo(
    () => getOptionValue(systemOptionsData?.data, PRICING_OPTION_DEFAULTS),
    [systemOptionsData]
  )

  const editData: ModelRatioData | null = useMemo(() => {
    if (!modelName) return null
    return buildPricingEditData(source, modelName)
  }, [source, modelName])

  const handleSave = async (data: ModelRatioData) => {
    try {
      const updated = applyPricingToMaps(source, data)

      // Only push the option maps that actually changed.
      const changed = PRICING_OPTION_KEYS.filter(
        (key) =>
          normalizeJsonString(updated[key]) !==
          normalizeJsonString(source[key] ?? '')
      )

      for (const key of changed) {
        const res = await updateSystemOption({ key, value: updated[key] })
        if (!res.success) {
          throw new Error(res.message || t('Failed to update setting'))
        }
      }

      toast.success(t('Pricing updated successfully'))
      queryClient.invalidateQueries({ queryKey: ['system-options'] })
      queryClient.invalidateQueries({ queryKey: ['pricing'] })
      queryClient.invalidateQueries({ queryKey: modelsQueryKeys.lists() })
    } catch (error: unknown) {
      toast.error((error as Error)?.message || t('Failed to update setting'))
    }
  }

  return (
    <ModelPricingSheet
      open={open}
      onOpenChange={onOpenChange}
      onSave={handleSave}
      editData={editData}
    />
  )
}
