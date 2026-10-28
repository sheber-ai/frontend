import { describe, expect, it } from 'vitest'
import { CAMERA_VIEWS, cameraPosition, fitDistance, visibleExtent } from './camera'

const SIZE = { width: 1.8, height: 2.4, depth: 0.6 }

describe('camera views', () => {
	it('looks at the matching faces of the piece', () => {
		expect(visibleExtent('front', SIZE)).toEqual({ across: 1.8, up: 2.4, deep: 0.6 })
		expect(visibleExtent('side', SIZE)).toEqual({ across: 0.6, up: 2.4, deep: 1.8 })
		expect(visibleExtent('top', SIZE)).toEqual({ across: 1.8, up: 0.6, deep: 2.4 })
	})

	it('backs off further on a narrow canvas than on a wide one', () => {
		expect(fitDistance('front', SIZE, 35, 0.5)).toBeGreaterThan(fitDistance('front', SIZE, 35, 2))
	})

	it('places the camera on the right side of the target', () => {
		const target = [0, 1.2, 0] as const
		const front = cameraPosition('front', SIZE, target, 35, 1.3)
		const side = cameraPosition('side', SIZE, target, 35, 1.3)
		const top = cameraPosition('top', SIZE, target, 35, 1.3)
		expect(front[0]).toBeCloseTo(0)
		expect(front[2]).toBeGreaterThan(0)
		expect(side[0]).toBeGreaterThan(0)
		expect(side[2]).toBeCloseTo(0)
		expect(top[1]).toBeGreaterThan(target[1])
	})

	it('keeps every view at a finite distance', () => {
		for (const view of CAMERA_VIEWS)
			expect(Number.isFinite(fitDistance(view, SIZE, 35, 1))).toBe(true)
	})
})
