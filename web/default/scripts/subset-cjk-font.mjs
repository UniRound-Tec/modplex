/*
 * Build-time CJK font subsetter.
 *
 * The source face — 字体管家波点 (AaSpot), a dot-matrix display font that
 * matches the nothing-design dot motif — ships the full GB2312 set (~6.7k
 * glyphs, 5.2 MB TTF). We never want to serve that whole. This script scans
 * the frontend for every character that can actually render (source string
 * literals + all i18n locale values), then subsets the face down to just
 * those code points and emits a small woff2 that Rsbuild bundles.
 *
 * Runs automatically before `dev` and `build` (see package.json). It is
 * idempotent and skips regeneration when the output is newer than the source
 * font and this script — so warm dev restarts pay nothing.
 */
import subsetFont from 'subset-font'
import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SOURCE_FONT = join(root, 'fonts', 'aaspot.ttf')
const OUTPUT = join(root, 'src', 'assets', 'fonts', 'aaspot-cjk.woff2')

// Directories to scan for characters that may be rendered.
const SCAN_DIRS = [join(root, 'src')]
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json'])

// Any code point >= 0x2E80 is treated as CJK-ish (covers CJK unified,
// extensions, radicals, kana, and full/half-width forms). ASCII printable is
// always included so the face can stand alone if ever used for a Latin label.
function isRenderableCodePoint(cp) {
  if (cp >= 0x20 && cp <= 0x7e) return true // ASCII printable
  if (cp >= 0x2e80) return true // CJK & friends
  // Common CJK punctuation / symbols living below 0x2E80.
  if (cp >= 0x2010 && cp <= 0x203b) return true // dashes, quotes, dots, …
  return false
}

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      yield* walk(full)
    } else if (SCAN_EXT.has(extname(entry.name))) {
      yield full
    }
  }
}

async function collectChars() {
  const chars = new Set()
  // Always keep the full ASCII printable range.
  for (let cp = 0x20; cp <= 0x7e; cp++) chars.add(String.fromCodePoint(cp))

  for (const scanDir of SCAN_DIRS) {
    for await (const file of walk(scanDir)) {
      const text = readFileSync(file, 'utf8')
      for (const ch of text) {
        const cp = ch.codePointAt(0)
        if (isRenderableCodePoint(cp)) chars.add(ch)
      }
    }
  }
  return chars
}

function isStale() {
  if (!existsSync(OUTPUT)) return true
  try {
    const out = statSync(OUTPUT).mtimeMs
    const src = statSync(SOURCE_FONT).mtimeMs
    const self = statSync(fileURLToPath(import.meta.url)).mtimeMs
    return out < src || out < self
  } catch {
    return true
  }
}

async function main() {
  if (!existsSync(SOURCE_FONT)) {
    console.warn(`[subset-cjk-font] source font missing: ${SOURCE_FONT} — skipping`)
    return
  }
  if (!isStale()) {
    console.log('[subset-cjk-font] up to date, skipping')
    return
  }

  const chars = await collectChars()
  const text = [...chars].join('')

  const buf = readFileSync(SOURCE_FONT)
  const out = await subsetFont(buf, text, { targetFormat: 'woff2' })
  writeFileSync(OUTPUT, out)

  const cjk = [...chars].filter((c) => c.codePointAt(0) >= 0x2e80).length
  console.log(
    `[subset-cjk-font] ${chars.size} glyphs (${cjk} CJK) → ${OUTPUT} ` +
      `(${(out.length / 1024).toFixed(1)} KB, from ${(buf.length / 1024 / 1024).toFixed(1)} MB)`,
  )
}

main().catch((err) => {
  console.error('[subset-cjk-font] failed:', err)
  process.exit(1)
})
