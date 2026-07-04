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
import { LogOut, Settings, User, Wallet } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { getUserAvatarFallback } from '@/lib/avatar'
import { ROLE } from '@/lib/roles'
import useDialogState from '@/hooks/use-dialog'
import { useUserDisplay } from '@/hooks/use-user-display'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

/** Identity as instrument: a sharp monochrome square with the user's initials
 *  in Space Mono. Kept compact (28px) so it reads as a chip, not a button. */
const TRIGGER =
  'nd-mono ml-1.5 flex size-7 shrink-0 items-center justify-center rounded-none border border-[var(--nd-border-visible)] text-[11px] font-medium tracking-wide text-[var(--nd-text-secondary)] transition-colors duration-200 hover:border-[var(--nd-text-display)] hover:text-[var(--nd-text-display)]'

const ITEM =
  'nd-mono flex cursor-pointer items-center gap-2.5 rounded-none px-3 py-2 text-[12px] tracking-wide text-[var(--nd-text-secondary)] focus:bg-[var(--nd-surface-raised)] focus:text-[var(--nd-text-display)]'

/**
 * Logged-in account control for the Modplex landing, in the Nothing idiom:
 * a square initials chip (no round avatar), a flat sharp-cornered menu, mono
 * labels. Sign-out carries the screen's one red signal.
 */
export function LandingProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useDialogState()
  const user = useAuthStore((state) => state.auth.user)
  const { displayName, roleLabel } = useUserDisplay(user)
  const isSuperAdmin = user?.role === ROLE.SUPER_ADMIN
  const avatarName = user?.username || displayName
  const initials = getUserAvatarFallback(avatarName)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={TRIGGER} aria-label={displayName}>
          {initials}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          sideOffset={12}
          className='nd-scope w-60 gap-0 rounded-none border border-[var(--nd-border-visible)] bg-[var(--nd-surface)] p-0 text-[var(--nd-text-primary)] shadow-none ring-0'
        >
          {/* Identity block */}
          <div className='flex items-center gap-2.5 border-b border-[var(--nd-border)] px-3 py-3'>
            <span className='nd-mono flex size-8 shrink-0 items-center justify-center border border-[var(--nd-border-visible)] text-[12px] text-[var(--nd-text-display)]'>
              {initials}
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[13px] font-medium text-[var(--nd-text-display)]'>
                {displayName}
              </p>
              <p className='nd-mono mt-0.5 truncate text-[10px] tracking-[0.12em] text-[var(--nd-text-disabled)]'>
                {roleLabel}
                {user?.group ? ` · ${String(user.group)}` : ''}
              </p>
            </div>
          </div>

          <div className='p-1'>
            <DropdownMenuItem
              className={ITEM}
              onClick={() => navigate({ to: '/profile' })}
            >
              <User className='size-4' strokeWidth={1.5} />
              {t('Profile')}
            </DropdownMenuItem>

            <DropdownMenuItem
              className={ITEM}
              onClick={() => navigate({ to: '/wallet' })}
            >
              <Wallet className='size-4' strokeWidth={1.5} />
              {t('Wallet')}
            </DropdownMenuItem>

            {isSuperAdmin && (
              <DropdownMenuItem
                className={ITEM}
                onClick={() =>
                  navigate({
                    to: '/system-settings/site/$section',
                    params: { section: 'system-info' },
                  })
                }
              >
                <Settings className='size-4' strokeWidth={1.5} />
                {t('System Settings')}
              </DropdownMenuItem>
            )}
          </div>

          <div className='border-t border-[var(--nd-border)] p-1'>
            <DropdownMenuItem
              className={cn(
                ITEM,
                'text-[var(--nd-accent)] focus:bg-[var(--nd-surface-raised)] focus:text-[var(--nd-accent)]'
              )}
              onClick={() => setOpen(true)}
            >
              <LogOut className='size-4' strokeWidth={1.5} />
              {t('Sign out')}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
