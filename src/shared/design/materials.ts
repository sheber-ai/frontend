// Furniture finishes for 2D/3D renders. Renderers need concrete colors, so they live here with the other tokens.

export const HARDWARE = {
	/** Matte black steel */
	black: { base: '#2a2725', light: '#5a5550', dark: '#121110' },
	/** Brushed brass */
	brass: { base: '#b08d57', light: '#ecd6a4', dark: '#6f5329' },
} as const

export type HardwareName = keyof typeof HARDWARE

type WoodFinish = {
	finish: 'wood'
	color: string
	/** Dark fibers of the veneer */
	grain: string
	/** Light figure bands */
	figure: string
	roughness: number
	hardware: HardwareName
}

type PaintFinish = {
	finish: 'paint'
	color: string
	roughness: number
	hardware: HardwareName
}

export const MATERIALS = {
	oak: {
		finish: 'wood',
		color: '#c49a6c',
		grain: '#8a6136',
		figure: '#e3c79f',
		roughness: 0.65,
		hardware: 'black',
	},
	walnut: {
		finish: 'wood',
		color: '#6b4430',
		grain: '#38200f',
		figure: '#9a6a4a',
		roughness: 0.6,
		hardware: 'brass',
	},
	ivory: { finish: 'paint', color: '#ece5d8', roughness: 0.7, hardware: 'brass' },
	sage: { finish: 'paint', color: '#8fa489', roughness: 0.7, hardware: 'brass' },
	graphite: { finish: 'paint', color: '#3d3a37', roughness: 0.55, hardware: 'brass' },
} as const satisfies Record<string, WoodFinish | PaintFinish>

export type MaterialName = keyof typeof MATERIALS
export type Material = WoodFinish | PaintFinish

export const SCENE_COLORS = {
	/** Blueprint lines, matches --primary */
	line: '#944d24',
	/** Hardware: handles, legs */
	metal: '#2b2724',
	/** Back panel tint over the material color */
	backPanel: '#e9e2d6',
	/** Warm hemisphere lighting */
	skyLight: '#fff6ea',
	groundLight: '#b89a7c',
	/** Light and shadow used to shade 2D renders */
	light: '#fffaf2',
	shadow: '#1a120c',
} as const
