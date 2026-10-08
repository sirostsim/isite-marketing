/**
 * Regenerates the brand images in assets/brand/ from the same shapes as
 * assets/logo.svg, so they can never drift from the website logo.
 *
 * These are not used by the website. They are the files handed to people for
 * Microsoft 365 profile pictures and desktop wallpapers. Like the icon
 * generator beside it, this is NOT part of any build.
 *
 *   npm install @resvg/resvg-js
 *   node tools/generate-brand-assets.mjs
 *   PREVIEW=1 node tools/generate-brand-assets.mjs   (adds the circle check)
 *
 * Writes: assets/brand/isite-profile-648.png
 *         assets/brand/isite-wallpaper-3840x2160.png
 *         assets/brand/isite-wallpaper-1920x1080.png
 */
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'brand')
mkdirSync(OUT, { recursive: true })

const PIN = 'M256 104 c-63 0 -114 51 -114 114 c0 84 114 186 114 186 c0 0 114 -102 114 -186 c0 -63 -51 -114 -114 -114 Z'
const FONT = 'Segoe UI'

const render = (svg, w) => new Resvg(svg, {
  fitTo: { mode: 'width', value: w },
  font: { loadSystemFonts: true, defaultFontFamily: FONT },
}).render().asPng()

/** The pin, the dark disc and the white "i", as one group centred on (cx, cy). */
const mark = (cx, cy, scale, discFill) => `<g transform="translate(${cx} ${cy}) scale(${scale}) translate(-256 -254)">
    <path d="${PIN}" fill="url(#pin)"/>
    <circle cx="256" cy="212" r="52" fill="${discFill}"/>
    <circle cx="256" cy="192" r="21" fill="#ffffff"/>
    <rect x="242" y="226" width="28" height="74" rx="14" fill="#ffffff"/>
  </g>`

const PIN_GRADIENT = `<linearGradient id="pin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4FE2EC"/><stop offset="1" stop-color="#17A8C4"/>
    </linearGradient>`

/* -- Microsoft 365 profile picture ----------------------------------------
   648x648 is the largest size Microsoft 365 stores.

   No rounded tile: this gets masked to a circle nearly everywhere it appears,
   and a pre-rounded tile would be clipped twice. The mark is kept well inside
   the inscribed circle so the mask never crops it; run with PREVIEW=1 to check
   that after changing anything.

   The mark carries no wordmark on purpose. At the ~32px this is displayed at
   in Teams and Outlook, lettering turns to mud while the pin silhouette still
   reads. */
const PROFILE = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#1B4570"/><stop offset="0.55" stop-color="#10243D"/><stop offset="1" stop-color="#0B1E35"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#38D6E0" stop-opacity="0.22"/><stop offset="1" stop-color="#38D6E0" stop-opacity="0"/>
    </radialGradient>
    ${PIN_GRADIENT}
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <ellipse cx="150" cy="90" rx="320" ry="260" fill="url(#glow)"/>
  ${mark(256, 254, 1.12, '#0E2540')}
</svg>`

/* -- Desktop wallpaper -----------------------------------------------------
   Authored once at 1920x1080 and rendered at both sizes, so the two never
   diverge.

   The block is centred rather than set to one side because Windows puts
   desktop icons top-left and the taskbar bottom-centre, so centred stays clear
   of both. The navy is dark enough that white icon labels stay readable over
   it. No rounded tile here either: on a wallpaper that reads as an app icon
   stuck to the desktop. */
const WALLPAPER = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#17406B"/><stop offset="0.5" stop-color="#10243D"/><stop offset="1" stop-color="#0A1B30"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#38D6E0" stop-opacity="0.20"/><stop offset="1" stop-color="#38D6E0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#12A3BE" stop-opacity="0.24"/><stop offset="1" stop-color="#12A3BE" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#38D6E0" stop-opacity="0.16"/><stop offset="1" stop-color="#38D6E0" stop-opacity="0"/>
    </radialGradient>
    ${PIN_GRADIENT}
  </defs>

  <rect width="1920" height="1080" fill="url(#bg)"/>
  <ellipse cx="1560" cy="60" rx="900" ry="560" fill="url(#glowA)"/>
  <ellipse cx="260" cy="1030" rx="820" ry="520" fill="url(#glowB)"/>
  <ellipse cx="960" cy="400" rx="520" ry="420" fill="url(#halo)"/>

  ${mark(960, 380, 1.05, '#0B1E35')}

  <text x="960" y="672" text-anchor="middle" font-family="${FONT}" font-size="124" font-weight="700" fill="#ffffff" letter-spacing="-3">iSite<tspan font-size="40" font-weight="600" dy="-48" fill="#9FB6CC">&#8482;</tspan></text>
  <text x="960" y="742" text-anchor="middle" font-family="${FONT}" font-size="27" font-weight="600" fill="#7E99B4" letter-spacing="9">SITE ACCESS  &#183;  INDUCTION  &#183;  ATTENDANCE</text>
</svg>`

writeFileSync(join(OUT, 'isite-profile-648.png'), render(PROFILE, 648))
writeFileSync(join(OUT, 'isite-wallpaper-3840x2160.png'), render(WALLPAPER, 3840))
writeFileSync(join(OUT, 'isite-wallpaper-1920x1080.png'), render(WALLPAPER, 1920))

// Shows the profile picture as Microsoft 365 will mask it. Worth looking at
// after any change to the mark or its scale. Not committed.
if (process.env.PREVIEW) {
  const masked = PROFILE.replace(
    '<rect width="512" height="512" fill="url(#bg)"/>',
    '<clipPath id="circle"><circle cx="256" cy="256" r="256"/></clipPath><rect width="512" height="512" fill="url(#bg)" clip-path="url(#circle)"/>',
  )
  writeFileSync(join(OUT, 'preview-profile-circle.png'), render(masked, 400))
  console.log('PREVIEW: wrote preview-profile-circle.png (do not commit)')
}

console.log('Wrote the profile picture and both wallpapers to assets/brand/')
