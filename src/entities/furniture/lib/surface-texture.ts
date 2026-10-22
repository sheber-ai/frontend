import * as THREE from 'three'
import { type Material, SCENE_COLORS } from '@/shared/design'
import { mix } from './color'

const SIZE = 512
const cache = new Map<string, THREE.CanvasTexture>()

function seeded(seed: number) {
	let state = seed
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296
		return state / 4294967296
	}
}

/** Veneer: long wavy fibres plus soft lighter figure bands. Grain runs along the texture's v axis. */
function paintWood(
	context: CanvasRenderingContext2D,
	material: Extract<Material, { finish: 'wood' }>,
) {
	const random = seeded(material.color.length * 7919 + material.grain.charCodeAt(3))
	context.fillStyle = material.color
	context.fillRect(0, 0, SIZE, SIZE)

	for (let band = 0; band < 7; band++) {
		const x = random() * SIZE
		const width = 20 + random() * 60
		const gradient = context.createLinearGradient(x - width, 0, x + width, 0)
		gradient.addColorStop(0, `${material.figure}00`)
		gradient.addColorStop(0.5, `${material.figure}55`)
		gradient.addColorStop(1, `${material.figure}00`)
		context.fillStyle = gradient
		context.fillRect(x - width, 0, width * 2, SIZE)
	}

	for (let line = 0; line < 140; line++) {
		const x = random() * SIZE
		const amplitude = 2 + random() * 6
		const frequency = 1 + random() * 3
		const phase = random() * Math.PI * 2
		context.strokeStyle = `${material.grain}${Math.round(20 + random() * 45)
			.toString(16)
			.padStart(2, '0')}`
		context.lineWidth = 0.5 + random() * 1.6
		context.beginPath()
		for (let y = 0; y <= SIZE; y += 8) {
			const offset = Math.sin((y / SIZE) * Math.PI * 2 * frequency + phase) * amplitude
			if (y === 0) context.moveTo(x + offset, y)
			else context.lineTo(x + offset, y)
		}
		context.stroke()
	}
}

/** Paint: almost flat, with a faint roller texture so large fronts do not look like plastic. */
function paintSolid(context: CanvasRenderingContext2D, color: string) {
	const random = seeded(color.charCodeAt(2) * 104729)
	context.fillStyle = color
	context.fillRect(0, 0, SIZE, SIZE)
	for (let index = 0; index < 2400; index++) {
		const shade = random() > 0.5 ? SCENE_COLORS.light : SCENE_COLORS.shadow
		context.fillStyle = `${mix(color, shade, 0.5)}0d`
		context.fillRect(random() * SIZE, random() * SIZE, 2 + random() * 3, 1 + random() * 2)
	}
}

export function surfaceTexture(name: string, material: Material): THREE.CanvasTexture | null {
	if (typeof document === 'undefined') return null
	const cached = cache.get(name)
	if (cached) return cached

	const canvas = document.createElement('canvas')
	canvas.width = SIZE
	canvas.height = SIZE
	const context = canvas.getContext('2d')
	if (!context) return null
	if (material.finish === 'wood') paintWood(context, material)
	else paintSolid(context, material.color)

	const texture = new THREE.CanvasTexture(canvas)
	texture.colorSpace = THREE.SRGBColorSpace
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.anisotropy = 4
	cache.set(name, texture)
	return texture
}
