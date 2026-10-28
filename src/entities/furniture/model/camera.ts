import type { Size } from './document'

export const CAMERA_VIEWS = ['iso', 'front', 'side', 'top'] as const
export type CameraView = (typeof CAMERA_VIEWS)[number]

type Vec3 = readonly [number, number, number]

const normalize = ([x, y, z]: Vec3): Vec3 => {
	const length = Math.hypot(x, y, z)
	return [x / length, y / length, z / length]
}

/** Where the camera looks from, relative to the model centre. Top keeps a hair of depth so "up" stays defined. */
export const VIEW_DIRECTIONS: Record<CameraView, Vec3> = {
	iso: normalize([0.42, 0.22, 0.88]),
	front: [0, 0, 1],
	side: [1, 0, 0],
	top: normalize([0, 1, 0.001]),
}

/** Width and height of what the camera sees from this side, same units as `size`. */
export function visibleExtent(
	view: CameraView,
	size: Size,
): { across: number; up: number; deep: number } {
	const { width, height, depth } = size
	switch (view) {
		case 'front':
			return { across: width, up: height, deep: depth }
		case 'side':
			return { across: depth, up: height, deep: width }
		case 'top':
			return { across: width, up: depth, deep: height }
		default:
			return { across: Math.hypot(width, depth), up: height, deep: depth }
	}
}

/**
 * Camera distance that fits the piece (with room for dimension labels) into both axes of the frame.
 * `fov` is vertical, in degrees; `aspect` is width / height of the canvas.
 */
export function fitDistance(view: CameraView, size: Size, fov: number, aspect: number): number {
	const { across, up, deep } = visibleExtent(view, size)
	const vertical = Math.tan((fov * Math.PI) / 360)
	const horizontal = vertical * aspect
	const fitUp = (up * 1.5) / 2 / vertical
	const fitAcross = (across * 1.4) / 2 / horizontal
	return Math.max(fitUp, fitAcross) + deep / 2
}

/** Camera position for a view, looking at `target`. */
export function cameraPosition(
	view: CameraView,
	size: Size,
	target: Vec3,
	fov: number,
	aspect: number,
): Vec3 {
	const distance = fitDistance(view, size, fov, aspect)
	const [dx, dy, dz] = VIEW_DIRECTIONS[view]
	return [target[0] + dx * distance, target[1] + dy * distance, target[2] + dz * distance]
}
