import { z } from 'zod'
import { MATERIALS, type MaterialName } from '@/shared/design'

// Constructor document, sizes in mm. Mirrors backend/schemas/designs/sch_document.py.

export type Axis = 'x' | 'y'

export type Fill =
	| { type: 'empty' }
	| { type: 'shelves'; count: number }
	| { type: 'rod' }
	| { type: 'drawers'; count: number }

export type FillType = Fill['type']

export type Hinge = 'left' | 'right' | 'double'
export type Door = { hinge: Hinge }

export type CellNode = { id: string; kind: 'cell'; fill: Fill; door: Door | null }

/** `size: null` takes an equal share of what fixed siblings leave. */
export type SplitChild = { size: number | null; node: LayoutNode }

/** `x` places children left to right, `y` top to bottom. */
export type SplitNode = {
	id: string
	kind: 'split'
	axis: Axis
	children: SplitChild[]
	door: Door | null
}

export type LayoutNode = CellNode | SplitNode

export type FacadeType = 'open' | 'hinged' | 'sliding'

export type Size = { width: number; height: number; depth: number }

export type DesignDocument = {
	schemaVersion: 1
	size: Size
	plinth: number
	materials: { body: MaterialName; fronts: MaterialName }
	facade: { type: FacadeType; panels: number }
	layout: LayoutNode
}

/** Carcass and shelf board */
export const PANEL = 16
/** Fiberboard back panel */
export const BACK = 4
/** Doors and drawer fronts */
export const FRONT = 18
/** Clearance around fronts */
export const FRONT_GAP = 2
/** Shelves are set back from the front edge */
export const SHELF_INSET = 20

export const LIMITS = {
	width: { min: 300, max: 3600 },
	height: { min: 300, max: 2800 },
	depth: { min: 250, max: 900 },
	plinth: { min: 0, max: 200 },
	childSize: { min: 50, max: 3600 },
	children: { min: 2, max: 12 },
	shelves: { min: 1, max: 12 },
	drawers: { min: 1, max: 8 },
	slidingPanels: { min: 2, max: 4 },
	depthLevels: 8,
} as const

export const FILL_TYPES = ['empty', 'shelves', 'rod', 'drawers'] as const satisfies FillType[]
export const FACADE_TYPES = ['open', 'hinged', 'sliding'] as const satisfies FacadeType[]

const materialSchema = z.enum(Object.keys(MATERIALS) as [MaterialName, ...MaterialName[]])
const doorSchema = z.object({ hinge: z.enum(['left', 'right', 'double']) })
const fillSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('empty') }),
	z.object({
		type: z.literal('shelves'),
		count: z.number().int().min(LIMITS.shelves.min).max(LIMITS.shelves.max),
	}),
	z.object({ type: z.literal('rod') }),
	z.object({
		type: z.literal('drawers'),
		count: z.number().int().min(LIMITS.drawers.min).max(LIMITS.drawers.max),
	}),
])

const nodeSchema: z.ZodType<LayoutNode> = z.lazy(() =>
	z.discriminatedUnion('kind', [
		z.object({
			id: z.string().min(1),
			kind: z.literal('cell'),
			fill: fillSchema,
			door: doorSchema.nullable().default(null),
		}),
		z.object({
			id: z.string().min(1),
			kind: z.literal('split'),
			axis: z.enum(['x', 'y']),
			children: z
				.array(z.object({ size: z.number().int().nullable().default(null), node: nodeSchema }))
				.min(LIMITS.children.min),
			door: doorSchema.nullable().default(null),
		}),
	]),
)

const documentSchema = z.object({
	schemaVersion: z.literal(1),
	size: z.object({ width: z.number(), height: z.number(), depth: z.number() }),
	plinth: z.number(),
	materials: z.object({ body: materialSchema, fronts: materialSchema }),
	facade: z.object({ type: z.enum(FACADE_TYPES), panels: z.number().int().default(2) }),
	layout: nodeSchema,
})

/** Validates a document that came from the API. */
export function parseDocument(value: unknown): DesignDocument {
	return documentSchema.parse(value)
}

export function isDesignDocument(value: unknown): value is DesignDocument {
	return documentSchema.safeParse(value).success
}
