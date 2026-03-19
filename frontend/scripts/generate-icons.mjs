import { createCanvas, loadImage } from 'canvas'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'

function svgToPng(svgBuffer, size) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: { mode: 'width', value: size },
  })
  return resvg.render().asPng()
}

async function generateIcon(size, variant) {
  const iconColor = variant === 'dark' ? '#0a0a0a' : '#ffffff'

  let svg = readFileSync('scripts/film.svg', 'utf8')
  svg = svg
    .replace(/stroke="[^"]*"/g, `stroke="${iconColor}"`)
    .replace(/fill="[^"]*"/g, `fill="none"`)

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const pad = size * 0.18
  const iconSize = size - pad * 2
  const iconPng = svgToPng(Buffer.from(svg), iconSize)

  const img = await loadImage(iconPng)
  ctx.drawImage(img, pad, pad, iconSize, iconSize)

  return canvas
}

async function main() {
  mkdirSync('public', { recursive: true })

  // PWA icons
  const sizes = [192, 512]
  const variants = ['dark', 'light']

  for (const size of sizes) {
    for (const variant of variants) {
      const canvas = await generateIcon(size, variant)
      writeFileSync(`public/icon-${size}-${variant}.png`, canvas.toBuffer('image/png'))
      console.log(`✅ public/icon-${size}-${variant}.png`)
    }
  }

  // favicon.ico with 16, 32, 64 bundled
  const icoSizes = [16, 32, 64]
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => {
      const c = await generateIcon(size, 'dark')
      return c.toBuffer('image/png')
    })
  )
  const icoBuffer = await pngToIco(icoPngs)
  writeFileSync('public/favicon.ico', icoBuffer)
  console.log('✅ public/favicon.ico (16, 32, 64)')
}

main().catch(console.error)
