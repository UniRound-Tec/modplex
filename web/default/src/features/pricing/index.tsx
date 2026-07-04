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
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import {
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  PricingTable,
  PricingSidebar,
  PricingToolbar,
  ModelCardGrid,
  ModelDetailsDrawer,
} from './components'
import { EXCLUDED_GROUPS, VIEW_MODES } from './constants'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  )
  // Persists across close so the drawer stays mounted for its exit animation.
  const [drawerModelName, setDrawerModelName] = useState<string | null>(null)

  const {
    models,
    vendors,
    groupRatio,
    usableGroup,
    endpointMap,
    autoGroups,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    searchInput,
    sortBy,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    tokenUnit,
    viewMode,
    showRechargePrice,
    setSearchInput,
    setSortBy,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setTagFilter,
    setTokenUnit,
    setViewMode,
    setShowRechargePrice,
    filteredModels,
    hasActiveFilters,
    activeFilterCount,
    availableTags,
    clearFilters,
    clearSearch,
  } = useFilters(models || [])

  const handleModelClick = useCallback((modelName: string) => {
    setSelectedModelName(modelName)
    setDrawerModelName(modelName)
  }, [])

  const selectedModel = useMemo(
    () =>
      selectedModelName
        ? (models || []).find(
            (model) => model.model_name === selectedModelName
          ) || null
        : null,
    [models, selectedModelName]
  )

  // `open` is driven by `selectedModel`; `drawerModel` keeps the last opened
  // model (cleared only when reopened) so the drawer stays mounted through its
  // exit animation after `selectedModelName` is reset on close.
  const drawerModel = useMemo(
    () =>
      drawerModelName
        ? (models || []).find(
            (model) => model.model_name === drawerModelName
          ) || null
        : null,
    [models, drawerModelName]
  )

  const availableGroups = useMemo(
    () =>
      Object.keys(usableGroup || {}).filter(
        (g) => !EXCLUDED_GROUPS.includes(g)
      ),
    [usableGroup]
  )

  const handleClearAll = useCallback(() => {
    clearFilters()
    clearSearch()
  }, [clearFilters, clearSearch])

  const renderPricingContent = () => {
    if (filteredModels.length === 0) {
      return (
        <EmptyState
          searchQuery={searchInput}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAll}
        />
      )
    }

    if (viewMode === VIEW_MODES.CARD) {
      return (
        <ModelCardGrid
          models={filteredModels}
          onModelClick={handleModelClick}
          priceRate={priceRate}
          usdExchangeRate={usdExchangeRate}
          tokenUnit={tokenUnit}
          showRechargePrice={showRechargePrice}
        />
      )
    }

    return (
      <PricingTable
        models={filteredModels}
        priceRate={priceRate}
        usdExchangeRate={usdExchangeRate}
        tokenUnit={tokenUnit}
        showRechargePrice={showRechargePrice}
        onModelClick={handleModelClick}
      />
    )
  }

  if (isLoading) {
    return (
      <PublicLayout showMainContainer={false} bgIntensity={2.2}>
        <div className='modplex-pricing nd-scope min-h-svh bg-transparent!'>
          <div className='mx-auto min-h-svh w-full max-w-7xl border-x border-[var(--nd-border)] bg-[color-mix(in_srgb,var(--nd-bg)_38%,transparent)] px-6 pt-16 pb-8 backdrop-blur-md md:px-8 sm:pt-20 sm:pb-10'>
            <LoadingSkeleton viewMode={viewMode} />
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false} bgIntensity={2.2}>
      <div className='modplex-pricing nd-scope min-h-svh bg-transparent!'>
        <PageTransition className='relative mx-auto min-h-svh w-full max-w-7xl border-x border-[var(--nd-border)] bg-[color-mix(in_srgb,var(--nd-bg)_38%,transparent)] px-6 pt-14 pb-10 backdrop-blur-md md:px-8 sm:pt-16 sm:pb-14'>
          {/* Header — asymmetric: identity left, the one hero number right. */}
          <header className='border-border mb-6 border-b pb-6 sm:mb-8 sm:pb-8'>
            <div className='flex flex-wrap items-end justify-between gap-x-8 gap-y-4'>
              <div className='min-w-0'>
                <p className='nd-eyebrow mb-2.5 text-[11px]'>
                  {t('Models Directory')}
                </p>
                <h1 className='text-foreground text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-bold tracking-tight'>
                  {t('Model Square')}
                </h1>
                <p className='text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed'>
                  {t(
                    'Discover curated AI models, compare pricing and capabilities, and choose the right model for every scenario.'
                  )}
                </p>
              </div>

              <div className='shrink-0 text-right'>
                <div
                  className='nd-meta text-foreground text-[clamp(2.5rem,6vw,4rem)] leading-none font-bold tabular-nums'
                  style={{ fontFamily: 'var(--nd-font-display)' }}
                >
                  {(models?.length || 0).toString().padStart(2, '0')}
                </div>
                <p className='nd-eyebrow mt-2 text-[10px]'>
                  {t('Models enabled')}
                </p>
              </div>
            </div>

            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={clearSearch}
              placeholder={t('Search model name, provider, endpoint, or tag...')}
              className='mt-6 max-w-2xl'
            />
          </header>

          <div className='grid gap-6 xl:grid-cols-[180px_minmax(0,1fr)] xl:gap-8'>
            <PricingSidebar
              vendorFilter={vendorFilter}
              groupFilter={groupFilter}
              tagFilter={tagFilter}
              onVendorChange={setVendorFilter}
              onGroupChange={setGroupFilter}
              onTagChange={setTagFilter}
              vendors={vendors || []}
              groups={availableGroups}
              groupRatios={groupRatio}
              tags={availableTags}
              models={models || []}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              className='hover-scrollbar sticky top-4 hidden max-h-[calc(100dvh-2rem)] self-start overflow-y-auto xl:block'
            />

            <main className='min-w-0 space-y-5'>
              <PricingToolbar
                filteredCount={filteredModels.length}
                totalCount={models?.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                tokenUnit={tokenUnit}
                onTokenUnitChange={setTokenUnit}
                showRechargePrice={showRechargePrice}
                onRechargePriceChange={setShowRechargePrice}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                quotaTypeFilter={quotaTypeFilter}
                endpointTypeFilter={endpointTypeFilter}
                vendorFilter={vendorFilter}
                groupFilter={groupFilter}
                tagFilter={tagFilter}
                onQuotaTypeChange={setQuotaTypeFilter}
                onEndpointTypeChange={setEndpointTypeFilter}
                onVendorChange={setVendorFilter}
                onGroupChange={setGroupFilter}
                onTagChange={setTagFilter}
                vendors={vendors || []}
                groups={availableGroups}
                groupRatios={groupRatio}
                tags={availableTags}
                models={models || []}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
              />

              {renderPricingContent()}
            </main>
          </div>

          {drawerModel && (
            <ModelDetailsDrawer
              open={Boolean(selectedModel)}
              onOpenChange={(open) => {
                if (!open) setSelectedModelName(null)
              }}
              model={drawerModel}
              groupRatio={groupRatio || {}}
              usableGroup={usableGroup || {}}
              endpointMap={
                (endpointMap as Record<
                  string,
                  { path?: string; method?: string }
                >) || {}
              }
              autoGroups={autoGroups || []}
              priceRate={priceRate ?? 1}
              usdExchangeRate={usdExchangeRate ?? 1}
              tokenUnit={tokenUnit}
              showRechargePrice={showRechargePrice}
            />
          )}
        </PageTransition>
      </div>
    </PublicLayout>
  )
}
