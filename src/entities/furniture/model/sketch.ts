import type { MaterialName } from '@/shared/design'
import { type Point3, project } from '../lib/iso'

/** Wardrobe sizes for 2D sketches, in centimeters. */
export type WardrobeSketch = {
	width: number
	height: number
	depth: number
	sections: number
	material: MaterialName
}

export const SKETCH_LIMITS = {
	width: { min: 60, max: 240, step: 10 },
	height: { min: 80, max: 240, step: 10 },
	sections: { min: 1, max: 4 },
} as const

export const DEFAULT_SKETCH: WardrobeSketch = {
	width: 120,
	height: 200,
	depth: 60,
	sections: 2,
	material: 'oak',
}

export const SKETCH_PLINTH = 8
export const DIMENSION_GAP = 18

/** Box corners centered on the floor origin. */
export function corners({
	width,
	height,
	depth,
}: Pick<WardrobeSketch, 'width' | 'height' | 'depth'>) {
	const x0 = -width / 2
	const x1 = width / 2
	const z0 = -depth / 2
	const z1 = depth / 2
	return { x0, x1, z0, z1, y0: 0, y1: height }
}

const LARGEST = {
	width: SKETCH_LIMITS.width.max,
	height: SKETCH_LIMITS.height.max,
	depth: DEFAULT_SKETCH.depth,
}

/** By default fits the largest wardrobe, so smaller ones visibly shrink. */
export function sketchViewBox(
	size: Pick<WardrobeSketch, 'width' | 'height' | 'depth'> = LARGEST,
	padding = 28,
): string {
	const { x0, x1, z0, z1, y1 } = corners(size)
	const g = DIMENSION_GAP + 6
	const points: Point3[] = [
		[x0 - g, 0, z1],
		[x0, y1, z0],
		[x1, y1, z0],
		[x1 + g, 0, z0],
		[x1 + g, 0, z1],
		[x0, 0, z1 + g],
		[x1, 0, z1 + g],
	]
	const projected = points.map(project)
	const xs = projected.map(([x]) => x)
	const ys = projected.map(([, y]) => y)
	const minX = Math.min(...xs) - padding
	const minY = Math.min(...ys) - padding
	return `${minX.toFixed(0)} ${minY.toFixed(0)} ${(Math.max(...xs) + padding - minX).toFixed(0)} ${(Math.max(...ys) + padding - minY).toFixed(0)}`
}
