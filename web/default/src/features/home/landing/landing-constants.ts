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
/**
 * Narrative landing — static data for the scene sequence.
 *
 * Every string here is an i18n *source key* (English), resolved through
 * `t()` at render time so the whole landing is multilingual. Numbers/units
 * are rendered verbatim (data, not prose).
 */

/** Public product wordmark for the landing. Display brand only — the
 *  QuantumNous / New API attribution is preserved in the closing scene. */
export const BRAND_NAME = 'Modplex'

export type SceneId = 'hero' | 'scale' | 'flow' | 'start'

/** Scene order + the instrument-panel label shown in the progress rail. */
export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'hero', label: 'Index' },
  { id: 'scale', label: 'Scale' },
  { id: 'flow', label: 'Flow' },
  { id: 'start', label: 'Start' },
]

/** Scene 02 — the numbers. First entry is the hero metric. */
export const SCALE_STATS = [
  { value: '50', suffix: '+', label: 'Upstream providers' },
  { value: '100', suffix: '+', label: 'Models billed' },
  { value: '50', suffix: '+', label: 'Compatible API routes' },
  { value: '10', suffix: '+', label: 'Scheduling controls' },
] as const

/** Scene 03 — the request lifecycle, told as three beats. */
export const FLOW_STEPS = [
  {
    index: '01',
    title: 'Connect',
    description:
      'Point any OpenAI-compatible client at one endpoint. One key, one base URL.',
  },
  {
    index: '02',
    title: 'Route',
    description:
      'Requests are translated and balanced across 40+ upstream providers in real time.',
  },
  {
    index: '03',
    title: 'Observe',
    description:
      'Every token is metered, priced and logged. Budgets and limits enforced per key.',
  },
] as const

/** Wheel/touch tuning for the scene navigator. */
export const NAV = {
  /** Accumulated wheel delta needed to commit a scene change. */
  wheelThreshold: 60,
  /** Min touch travel (px) to commit a swipe. */
  swipeThreshold: 50,
  /** Transition duration (s) — also the input lock window. */
  duration: 0.85,
} as const
