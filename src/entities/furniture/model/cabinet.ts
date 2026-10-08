import type { MaterialName } from '@/shared/design'

/** Sizes in meters. */
export type CabinetParams = {
	width: number
	height: number
	depth: number
	shelves: number
	material: MaterialName
	/** 0 closed, 1 fully open */
	doorOpen: number
	/** Solid surfaces opacity, 0 gives a pure wireframe */
	solidOpacity: number
	edgeOpacity: number
}

export const CABINET_LIMITS = {
	width: { min: 0.6, max: 2.4 },
	height: { min: 0.8, max: 2.6 },
	depth: { min: 0.35, max: 0.7 },
	maxShelves: 4,
} as const

export const DEFAULT_CABINET: CabinetParams = {
	width: 1.2,
	height: 2.1,
	depth: 0.6,
	shelves: 3,
	material: 'oak',
	doorOpen: 0,
	solidOpacity: 1,
	edgeOpacity: 0.25,
}

export const PANEL_THICKNESS = 0.018
export const PLINTH_HEIGHT = 0.08
