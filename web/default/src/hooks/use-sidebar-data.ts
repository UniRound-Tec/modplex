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
import { type ComponentProps, createElement } from 'react'
import {
  AiBrain01Icon,
  Analytics02Icon,
  BubbleChatIcon,
  Coupon01Icon,
  CreditCardIcon,
  DashboardSquare01Icon,
  DistributionIcon,
  Invoice03Icon,
  Key01Icon,
  Settings02Icon,
  TaskDone01Icon,
  TestTube01Icon,
  UserCircleIcon,
  UserMultiple02Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { type SidebarData } from '@/components/layout/types'

/**
 * Adapt a Hugeicons glyph to the `React.ElementType` the sidebar expects
 * (so `<item.icon className strokeWidth />` keeps working). The whole sidebar
 * uses the Hugeicons family — a single, precise instrument set that matches
 * the sidebar toggle and the nothing-design idiom. Wrappers are created at
 * module scope so their component identity stays stable across renders.
 */
type HiIcon = ComponentProps<typeof HugeiconsIcon>['icon']
type HiProps = Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'>
const hi = (icon: HiIcon) =>
  function NavIcon(props: HiProps) {
    return createElement(HugeiconsIcon, { icon, ...props })
  }

const ICON = {
  playground: hi(TestTube01Icon),
  chat: hi(BubbleChatIcon),
  overview: hi(Analytics02Icon),
  dashboard: hi(DashboardSquare01Icon),
  keys: hi(Key01Icon),
  usageLogs: hi(Invoice03Icon),
  taskLogs: hi(TaskDone01Icon),
  wallet: hi(Wallet01Icon),
  profile: hi(UserCircleIcon),
  channels: hi(DistributionIcon),
  models: hi(AiBrain01Icon),
  users: hi(UserMultiple02Icon),
  redemption: hi(Coupon01Icon),
  subscription: hi(CreditCardIcon),
  settings: hi(Settings02Icon),
}

/**
 * Root navigation groups for the application sidebar.
 *
 * These are shown when the URL does not match any nested sidebar view
 * registered in `layout/lib/sidebar-view-registry.ts`.
 */
export function useSidebarData(): SidebarData {
  const { t } = useTranslation()

  return {
    navGroups: [
      {
        id: 'chat',
        title: t('Chat'),
        items: [
          {
            title: t('Playground'),
            url: '/playground',
            icon: ICON.playground,
          },
          {
            title: t('Chat'),
            icon: ICON.chat,
            type: 'chat-presets',
          },
        ],
      },
      {
        id: 'general',
        title: t('General'),
        items: [
          {
            title: t('Overview'),
            url: '/dashboard/overview',
            icon: ICON.overview,
          },
          {
            title: t('Dashboard'),
            url: '/dashboard/models',
            icon: ICON.dashboard,
          },
          {
            title: t('API Keys'),
            url: '/keys',
            icon: ICON.keys,
          },
          {
            title: t('Usage Logs'),
            url: '/usage-logs/common',
            icon: ICON.usageLogs,
          },
          {
            title: t('Task Logs'),
            url: '/usage-logs/task',
            activeUrls: ['/usage-logs/drawing'],
            configUrls: ['/usage-logs/drawing', '/usage-logs/task'],
            icon: ICON.taskLogs,
          },
        ],
      },
      {
        id: 'personal',
        title: t('Personal'),
        items: [
          {
            title: t('Wallet'),
            url: '/wallet',
            icon: ICON.wallet,
          },
          {
            title: t('Profile'),
            url: '/profile',
            icon: ICON.profile,
          },
        ],
      },
      {
        id: 'admin',
        title: t('Admin'),
        items: [
          {
            title: t('Channels'),
            url: '/channels',
            icon: ICON.channels,
          },
          {
            title: t('Models'),
            url: '/models/metadata',
            icon: ICON.models,
          },
          {
            title: t('Users'),
            url: '/users',
            icon: ICON.users,
          },
          {
            title: t('Redemption Codes'),
            url: '/redemption-codes',
            icon: ICON.redemption,
          },
          {
            title: t('Subscription Management'),
            url: '/subscriptions',
            icon: ICON.subscription,
          },
          {
            title: t('System Settings'),
            url: '/system-settings/site',
            activeUrls: ['/system-settings'],
            icon: ICON.settings,
          },
        ],
      },
    ],
  }
}
