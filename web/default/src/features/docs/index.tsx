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
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'

/**
 * Internal documentation — scaffold only. Fill each section's body later
 * (Markdown, MDX, or plain JSX). The nav is derived from DOC_SECTIONS, so
 * adding an entry wires up both the sidebar link and the content anchor.
 */
type DocSection = {
  id: string
  /** i18n key (English source string). */
  title: string
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'authentication', title: 'Authentication' },
  { id: 'making-requests', title: 'Making Requests' },
  { id: 'models', title: 'Models' },
  { id: 'billing', title: 'Billing & Quota' },
  { id: 'errors', title: 'Errors & Rate Limits' },
]

function TocLink(props: { section: DocSection; label: string }) {
  return (
    <a
      href={`#${props.section.id}`}
      className={cn(
        'text-muted-foreground hover:border-foreground/40 hover:text-foreground',
        'flex w-full items-center border border-transparent px-2 py-1.5 text-xs font-medium transition-colors'
      )}
    >
      <span className='truncate'>{props.label}</span>
    </a>
  )
}

function SectionPlaceholder() {
  const { t } = useTranslation()
  return (
    <div className='border-border text-muted-foreground/70 mt-4 border border-dashed px-4 py-8'>
      <p className='nd-label text-[11px]'>{t('[ CONTENT PENDING ]')}</p>
      <p className='mt-2 text-sm leading-relaxed'>
        {t('This section has not been written yet.')}
      </p>
    </div>
  )
}

export function Docs() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false} bgIntensity={2.2}>
      <div className='modplex-docs nd-scope min-h-svh bg-transparent!'>
        <PageTransition className='relative mx-auto min-h-svh w-full max-w-7xl border-x border-[var(--nd-border)] bg-[color-mix(in_srgb,var(--nd-bg)_38%,transparent)] px-6 pt-14 pb-10 backdrop-blur-md md:px-8 sm:pt-16 sm:pb-14'>
          <header className='border-border mb-8 border-b pb-6'>
            <p className='nd-eyebrow mb-2.5 text-[11px]'>
              {t('Documentation')}
            </p>
            <h1 className='text-foreground text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-bold tracking-tight'>
              {t('Docs')}
            </h1>
            <p className='text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed'>
              {t(
                'Guides, API reference, and everything you need to integrate.'
              )}
            </p>
          </header>

          <div className='grid gap-8 xl:grid-cols-[180px_minmax(0,1fr)] xl:gap-10'>
            {/* Table of contents — sticky, one entry per row. */}
            <nav className='sticky top-4 hidden self-start xl:block'>
              <p className='nd-eyebrow text-muted-foreground mb-3 px-2 text-[10px]'>
                {t('On this page')}
              </p>
              <div className='flex flex-col gap-0.5'>
                {DOC_SECTIONS.map((section) => (
                  <TocLink
                    key={section.id}
                    section={section}
                    label={t(section.title)}
                  />
                ))}
              </div>
            </nav>

            {/* Content — placeholder per section, fill later. */}
            <main className='min-w-0 space-y-12'>
              {DOC_SECTIONS.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className='scroll-mt-20'
                >
                  <h2 className='text-foreground text-xl font-semibold tracking-tight'>
                    {t(section.title)}
                  </h2>
                  <SectionPlaceholder />
                </section>
              ))}
            </main>
          </div>
        </PageTransition>
      </div>
    </PublicLayout>
  )
}
