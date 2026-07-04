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
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  INTERFACE_LANGUAGE_OPTIONS,
  normalizeInterfaceLanguage,
} from '@/i18n/languages'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Shared trigger treatment for every header control — sharp, flat,
 *  monochrome, and the SAME 36px height + snug padding as the text nav links,
 *  so glyphs and labels read as one evenly-sized instrument row. */
export const LANDING_ICON_BTN =
  'flex h-9 shrink-0 items-center justify-center px-2 rounded-none bg-transparent text-[var(--nd-text-secondary)] transition-colors duration-200 hover:bg-transparent hover:text-[var(--nd-text-display)]'

/** Portaled dropdown/popover surfaces carry `nd-scope` so `--nd-*` resolve
 *  outside `.modplex-landing`, plus the sharp monochrome chrome. */
export const ND_MENU =
  'nd-scope min-w-44 rounded-none border border-[var(--nd-border-visible)] bg-[var(--nd-surface)] p-1 text-[var(--nd-text-primary)] shadow-none ring-0'

export const ND_ITEM =
  'nd-mono cursor-pointer rounded-none px-2 py-1.5 text-[12px] tracking-wide text-[var(--nd-text-secondary)] focus:bg-[var(--nd-surface-raised)] focus:text-[var(--nd-text-display)]'

/** Short instrument code per locale — "data as beauty": the current language
 *  is shown as Space Mono text, not a generic globe. */
const LANG_CODE: Record<string, string> = {
  zh: '中',
  en: 'EN',
  fr: 'FR',
  ru: 'RU',
  ja: '日',
  vi: 'VI',
}

/** A half-filled disc — a brightness/contrast instrument. Flips to encode the
 *  current mode (mechanical honesty: the control shows its state). */
function HalfDisc({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      className={cn('transition-transform duration-300', flipped && '-scale-x-100')}
      aria-hidden
    >
      <circle cx='12' cy='12' r='9' />
      <path d='M12 3a9 9 0 0 1 0 18z' fill='currentColor' stroke='none' />
    </svg>
  )
}

/** Single-press light/dark toggle — a physical switch, no dropdown. */
export function LandingThemeToggle() {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <button
      type='button'
      className={LANDING_ICON_BTN}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('Toggle theme')}
    >
      <HalfDisc flipped={isDark} />
    </button>
  )
}

export function LandingLangMenu() {
  const { i18n, t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const current = normalizeInterfaceLanguage(i18n.language)
  const code = LANG_CODE[current] ?? current.slice(0, 2).toUpperCase()

  const change = async (lang: string) => {
    await i18n.changeLanguage(lang)
    if (user) {
      try {
        await api.put('/api/user/self', { language: lang })
      } catch {
        /* best-effort */
      }
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(LANDING_ICON_BTN, 'nd-mono text-[11px] tracking-[0.08em]')}
        aria-label={t('Change language')}
      >
        {code}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className={ND_MENU}>
        {INTERFACE_LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={ND_ITEM}
            onClick={() => change(lang.code)}
          >
            {lang.label}
            <Check
              size={13}
              className={cn('ms-auto', current !== lang.code && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
