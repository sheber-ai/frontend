import { describe, expect, it } from 'vitest'
import { type DesignDocument, PANEL } from './document'
import { computeLayout, frontRect } from './layout'
import {
	addSection,
	cell,
	divideCell,
	findNode,
	removeNode,
	setChildSize,
	setDoor,
	split,
} from './operations'
import { buildParts } from './parts'
import { validateDocument } from './rules'
import { summarizeDesign } from './specs'
import { DESIGN_TEMPLATES } from './templates'

function wardrobe(): DesignDocument {
	return {
		schemaVersion: 1,
		size: { width: 1000, height: 2000, depth: 600 },
		plinth: 100,
		materials: { body: 'oak', fronts: 'ivory' },
		facade: { type: 'hinged', panels: 2 },
		layout: {
			id: 'root',
			kind: 'split',
			axis: 'x',
			door: null,
			children: [
				{
					size: 400,
					node: { id: 'a', kind: 'cell', fill: { type: 'rod' }, door: { hinge: 'left' } },
				},
				{
					size: null,
					node: { id: 'b', kind: 'cell', fill: { type: 'shelves', count: 3 }, door: null },
				},
			],
		},
	}
}

describe('computeLayout', () => {
	it('fills the interior with fixed and flexible sections', () => {
		const layout = computeLayout(wardrobe())

		expect(layout.interior).toEqual({
			x: PANEL,
			y: 100 + PANEL,
			w: 1000 - 2 * PANEL,
			h: 2000 - PANEL - 116,
		})
		expect(layout.nodes.get('a')?.rect).toMatchObject({ x: PANEL, w: 400 })
		expect(layout.nodes.get('b')?.rect).toMatchObject({
			x: PANEL + 400 + PANEL,
			w: 1000 - 3 * PANEL - 400,
		})
		expect(layout.dividers).toHaveLength(1)
		expect(layout.overflow.size).toBe(0)
	})

	it('stacks y splits from the top', () => {
		const doc = divideCell(wardrobe(), 'b', 'y', 2)
		const layout = computeLayout(doc)
		const [top, bottom] = (findNode(doc.layout, 'b') as { children: { node: { id: string } }[] })
			.children

		const topRect = layout.nodes.get(top?.node.id ?? '')?.rect
		const bottomRect = layout.nodes.get(bottom?.node.id ?? '')?.rect
		expect(topRect && bottomRect && topRect.y > bottomRect.y).toBe(true)
		expect(topRect && topRect.y + topRect.h).toBe(layout.interior.y + layout.interior.h)
	})

	it('flags fixed sizes that do not fit', () => {
		const layout = computeLayout(setChildSize(wardrobe(), 'root', 0, 3000))

		expect(layout.overflow.has('root')).toBe(true)
		expect(validateDocument(setChildSize(wardrobe(), 'root', 0, 3000))).toContainEqual(
			expect.objectContaining({ code: 'splitOverflow', level: 'error' }),
		)
	})
})

describe('frontRect', () => {
	it('covers the outer panels fully and inner ones by half', () => {
		const doc = wardrobe()
		const layout = computeLayout(doc)
		const rect = layout.nodes.get('a')?.rect ?? { x: 0, y: 0, w: 0, h: 0 }

		expect(frontRect(doc, layout, rect, 0)).toEqual({
			x: 0,
			y: 100,
			w: PANEL + 400 + PANEL / 2,
			h: 1900,
		})
	})
})

describe('operations', () => {
	it('keeps one flexible child in a split', () => {
		const doc = setChildSize(wardrobe(), 'root', 1, 300)
		const root = doc.layout.kind === 'split' ? doc.layout : null

		expect(root?.children.map((child) => child.size)).toEqual([null, 300])
	})

	it('collapses a split with one child left', () => {
		const doc = removeNode(wardrobe(), 'a')

		expect(doc.layout).toMatchObject({ id: 'root', kind: 'cell', fill: { type: 'shelves' } })
	})

	it('adds sections as flexible cells', () => {
		const doc = addSection(wardrobe(), 'root')

		expect(doc.layout.kind === 'split' && doc.layout.children.at(-1)).toMatchObject({
			size: null,
			node: { kind: 'cell', fill: { type: 'empty' } },
		})
	})

	it('moves a door instead of overlapping fronts', () => {
		const base = wardrobe()
		const withRootDoor = setDoor(base, 'root', { hinge: 'double' })
		const back = setDoor(withRootDoor, 'b', { hinge: 'right' })

		expect(findNode(withRootDoor.layout, 'a')?.door).toBeNull()
		expect(findNode(back.layout, 'root')?.door).toBeNull()
		expect(findNode(back.layout, 'b')?.door).toEqual({ hinge: 'right' })
	})

	it('does not mutate the input', () => {
		const doc = wardrobe()
		const snapshot = structuredClone(doc)

		divideCell(doc, 'a', 'y', 3)
		setDoor(doc, 'b', { hinge: 'left' })

		expect(doc).toEqual(snapshot)
	})
})

describe('parts and rules', () => {
	it('builds doors, shelves and a rod', () => {
		const parts = buildParts(wardrobe())

		expect(parts.filter((part) => part.kind === 'door')).toHaveLength(1)
		expect(parts.filter((part) => part.kind === 'shelf')).toHaveLength(3)
		expect(parts.filter((part) => part.kind === 'rod')).toHaveLength(1)
	})

	it('puts drawers behind doors inside the carcass', () => {
		const drawerCell = cell({ type: 'drawers', count: 2 })
		const open: DesignDocument = { ...wardrobe(), layout: split('x', [drawerCell, cell()]) }
		const closed = setDoor(open, drawerCell.id, { hinge: 'left' })

		const inside = buildParts(closed).find((part) => part.kind === 'drawer')
		const outside = buildParts(open).find((part) => part.kind === 'drawer')

		expect(inside && inside.box.z + inside.box.d).toBeLessThan(closed.size.depth)
		expect(outside?.box.z).toBe(open.size.depth)
	})

	it('warns about wide doors and narrow drawers', () => {
		const doc = setDoor(divideCell(wardrobe(), 'b', 'x', 3), 'b', { hinge: 'left' })
		const narrow = divideCell(
			{
				...wardrobe(),
				layout: { id: 'root', kind: 'cell', fill: { type: 'drawers', count: 2 }, door: null },
			},
			'root',
			'x',
			5,
		)

		expect(validateDocument(setDoor(wardrobe(), 'root', { hinge: 'left' }))).toContainEqual(
			expect.objectContaining({ code: 'doorTooWide' }),
		)
		expect(validateDocument(doc).some((issue) => issue.level === 'error')).toBe(false)
		expect(validateDocument(narrow)).toContainEqual(
			expect.objectContaining({ code: 'drawerTooNarrow' }),
		)
	})

	it('summarizes sections', () => {
		expect(summarizeDesign(wardrobe())).toMatchObject({
			sections: [400, 552],
			shelves: 3,
			rods: 1,
			doors: 1,
		})
	})

	it.each(DESIGN_TEMPLATES.map((template) => [template.id, template]))(
		'template %s has no errors',
		(_, template) => {
			const issues = validateDocument(template.build())

			expect(issues.filter((issue) => issue.level === 'error')).toEqual([])
		},
	)
})
