/**
 * Regenerates the raster brand assets from assets/logo.svg's shapes.
 *
 * This is NOT part of the build — the site is static and deploys as-is. Run it
 * only when the logo or the social-card copy changes, then commit the output.
 *
 *   npm install @resvg/resvg-js
 *   node tools/generate-assets.mjs
 *
 * Writes: favicon.ico (site root), assets/apple-touch-icon.png, assets/og-image.png
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets')
mkdirSync(OUT, { recursive: true })

const PIN = 'M256 104 c-63 0 -114 51 -114 114 c0 84 114 186 114 186 c0 0 114 -102 114 -186 c0 -63 -51 -114 -114 -114 Z'
const FONT = 'Segoe UI'
const GRADS = `
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173A5E"/><stop offset="1" stop-color="#0E2540"/></linearGradient>
    <linearGradient id="pin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38D6E0"/><stop offset="1" stop-color="#17A8C4"/></linearGradient>`

const render = (svg, w) => new Resvg(svg, {
  fitTo: { mode: 'width', value: w },
  font: { loadSystemFonts: true, defaultFontFamily: FONT },
}).render().asPng()

/* -- Favicons -------------------------------------------------------------
   The full logo nests three levels (tile > pin > dark disc > white "i") and
   that detail turns to mud below ~48px, so the small sizes get their own
   simplified marks rather than a squashed copy of the real one. */

// 16px: the pin silhouette alone. Shape is all that survives here.
const MARK_16 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRADS}</defs>
  <rect width="512" height="512" rx="112" fill="url(#tile)"/>
  <g transform="translate(256 254) scale(1.42) translate(-256 -254)"><path d="${PIN}" fill="url(#pin)"/></g>
</svg>`

// 32/48px: pin plus a bold navy "i" knocked straight out of it — two levels
// of contrast instead of three.
const MARK_32 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRADS}</defs>
  <rect width="512" height="512" rx="112" fill="url(#tile)"/>
  <g transform="translate(256 254) scale(1.28) translate(-256 -254)"><path d="${PIN}" fill="url(#pin)"/></g>
  <circle cx="256" cy="156" r="29" fill="#0E2540"/>
  <rect x="237" y="202" width="38" height="88" rx="19" fill="#0E2540"/>
</svg>`

// Home-screen icon: full-bleed square (iOS applies its own rounded mask, so a
// pre-rounded tile would get clipped twice) and the full-detail logo.
const MARK_APPLE = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRADS}</defs>
  <rect width="512" height="512" fill="url(#tile)"/>
  <g transform="translate(256 254) scale(1.12) translate(-256 -254)">
    <path d="${PIN}" fill="url(#pin)"/>
    <circle cx="256" cy="212" r="52" fill="#0E2540"/>
    <circle cx="256" cy="192" r="21" fill="#ffffff"/>
    <rect x="242" y="226" width="28" height="74" rx="14" fill="#ffffff"/>
  </g>
</svg>`

/** An .ico is just a small directory followed by embedded PNGs. */
function packIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)              // reserved
  header.writeUInt16LE(1, 2)              // type: icon
  header.writeUInt16LE(images.length, 4)
  const dir = Buffer.alloc(16 * images.length)
  let offset = header.length + dir.length
  images.forEach(({ size, data }, i) => {
    const at = i * 16
    dir.writeUInt8(size >= 256 ? 0 : size, at)      // 0 means 256
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1)
    dir.writeUInt16LE(1, at + 4)                    // colour planes
    dir.writeUInt16LE(32, at + 6)                   // bits per pixel
    dir.writeUInt32LE(data.length, at + 8)
    dir.writeUInt32LE(offset, at + 12)
    offset += data.length
  })
  return Buffer.concat([header, dir, ...images.map((i) => i.data)])
}

writeFileSync(join(ROOT, 'favicon.ico'), packIco([
  { size: 16, data: render(MARK_16, 16) },
  { size: 32, data: render(MARK_32, 32) },
  { size: 48, data: render(MARK_32, 48) },
]))
writeFileSync(join(OUT, 'apple-touch-icon.png'), render(MARK_APPLE, 180))

/* -- Social card ----------------------------------------------------------
   1200x630 is what Facebook, LinkedIn and X all crop from. PNG, because none
   of them render an SVG og:image. */
const OG = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${GRADS}
    <linearGradient id="bg" x1="0" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#173A5E"/><stop offset="0.55" stop-color="#10243D"/><stop offset="1" stop-color="#0E2540"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#38D6E0" stop-opacity="0.26"/><stop offset="1" stop-color="#38D6E0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#12A3BE" stop-opacity="0.30"/><stop offset="1" stop-color="#12A3BE" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="1020" cy="-40" rx="620" ry="380" fill="url(#glowA)"/>
  <ellipse cx="60" cy="690" rx="520" ry="340" fill="url(#glowB)"/>

  <g transform="translate(80 64)">
    <g transform="scale(0.1719)">
      <rect width="512" height="512" rx="112" fill="url(#tile)"/>
      <path d="${PIN}" fill="url(#pin)"/>
      <circle cx="256" cy="212" r="52" fill="#0E2540"/>
      <circle cx="256" cy="192" r="21" fill="#ffffff"/>
      <rect x="242" y="226" width="28" height="74" rx="14" fill="#ffffff"/>
    </g>
    <text x="106" y="62" font-family="${FONT}" font-size="44" font-weight="700" fill="#ffffff" letter-spacing="-1">iSite</text>
  </g>

  <text x="80" y="268" font-family="${FONT}" font-size="19" font-weight="700" fill="#38D6E0" letter-spacing="3.4">SITE ACCESS  &#183;  INDUCTION  &#183;  ATTENDANCE</text>
  <text x="80" y="352" font-family="${FONT}" font-size="58" font-weight="700" fill="#ffffff" letter-spacing="-1.4">Every worker inducted.</text>
  <text x="80" y="428" font-family="${FONT}" font-size="58" font-weight="700" fill="#ffffff" letter-spacing="-1.4">Every sign-in accounted for.</text>
  <rect x="80" y="474" width="72" height="4" rx="2" fill="#38D6E0"/>
  <text x="80" y="540" font-family="${FONT}" font-size="23" fill="#9FB0C4">Live attendance, honest man-hours and one-tap muster for UK construction.</text>
  <text x="80" y="582" font-family="${FONT}" font-size="21" font-weight="600" fill="#6E8299">isite.srscloud.co.uk</text>
</svg>`

writeFileSync(join(OUT, 'og-image.png'), render(OG, 1200))

console.log('Wrote favicon.ico (root), assets/apple-touch-icon.png, assets/og-image.png')
