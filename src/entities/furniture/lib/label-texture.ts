import * as THREE from 'three'

const cache = new Map<string, { texture: THREE.CanvasTexture; aspect: number }>()
const FONT_SIZE = 64
const PADDING = 22

/** Text badge as a texture: crisp at any zoom, no DOM overlay per label. */
export function labelTexture(text: string, foreground: string, background: string) {
	const key = `${text}|${foreground}|${background}`
	const cached = cache.get(key)
	if (cached) return cached

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')
	if (!context) return null
	const font = `600 ${FONT_SIZE}px "Onest Variable", ui-sans-serif, system-ui, sans-serif`
	context.font = font
	const width = Math.ceil(context.measureText(text).width) + PADDING * 2
	const height = FONT_SIZE + PADDING * 1.4
	canvas.width = width
	canvas.height = height

	context.font = font
	context.fillStyle = background
	context.beginPath()
	context.roundRect(0, 0, width, height, height / 2)
	context.fill()
	context.fillStyle = foreground
	context.textAlign = 'center'
	context.textBaseline = 'middle'
	context.fillText(text, width / 2, height / 2 + FONT_SIZE * 0.04)

	const texture = new THREE.CanvasTexture(canvas)
	texture.colorSpace = THREE.SRGBColorSpace
	texture.anisotropy = 4
	const entry = { texture, aspect: width / height }
	cache.set(key, entry)
	return entry
}
