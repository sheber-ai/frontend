import type { FurnitureTypeEnum } from '@/shared/api/generated/model'
import type { DesignDocument, LayoutNode } from './document'
import { cell, split } from './operations'

export type TemplateId =
	| 'wardrobeHinged'
	| 'wardrobeSliding'
	| 'shelvingOpen'
	| 'shelvingCabinet'
	| 'dresserClassic'
	| 'dresserWide'
	| 'tvStand'

export type DesignTemplate = {
	/** Also the i18n key: templates.<id> */
	id: TemplateId
	furnitureType: FurnitureTypeEnum
	build: () => DesignDocument
}

function doc(
	size: DesignDocument['size'],
	plinth: number,
	materials: DesignDocument['materials'],
	facade: DesignDocument['facade'],
	layout: LayoutNode,
): DesignDocument {
	return { schemaVersion: 1, size, plinth, materials, facade, layout }
}

const shelves = (count: number) => ({ type: 'shelves', count }) as const
const drawers = (count: number) => ({ type: 'drawers', count }) as const
const ROD = { type: 'rod' } as const

export const DESIGN_TEMPLATES: DesignTemplate[] = [
	{
		id: 'wardrobeHinged',
		furnitureType: 'wardrobe',
		build: () =>
			doc(
				{ width: 1800, height: 2400, depth: 600 },
				80,
				{ body: 'oak', fronts: 'ivory' },
				{ type: 'hinged', panels: 2 },
				split('x', [
					split('y', [{ size: 450, node: cell(shelves(1)) }, cell(ROD)], { hinge: 'left' }),
					cell(shelves(5), { hinge: 'right' }),
					split('y', [cell(shelves(2), { hinge: 'right' }), { size: 540, node: cell(drawers(3)) }]),
				]),
			),
	},
	{
		id: 'wardrobeSliding',
		furnitureType: 'wardrobe',
		build: () =>
			doc(
				{ width: 2400, height: 2400, depth: 650 },
				80,
				{ body: 'walnut', fronts: 'graphite' },
				{ type: 'sliding', panels: 2 },
				split('x', [
					split('y', [{ size: 400, node: cell(shelves(1)) }, cell(ROD)]),
					split('y', [cell(shelves(4)), { size: 500, node: cell(drawers(2)) }]),
					split('y', [{ size: 400, node: cell(shelves(1)) }, cell(ROD)]),
				]),
			),
	},
	{
		id: 'shelvingOpen',
		furnitureType: 'shelving',
		build: () =>
			doc(
				{ width: 1200, height: 2000, depth: 350 },
				40,
				{ body: 'oak', fronts: 'oak' },
				{ type: 'open', panels: 2 },
				split('x', [cell(shelves(4)), cell(shelves(4))]),
			),
	},
	{
		id: 'shelvingCabinet',
		furnitureType: 'shelving',
		build: () =>
			doc(
				{ width: 1600, height: 2100, depth: 400 },
				60,
				{ body: 'ivory', fronts: 'sage' },
				{ type: 'hinged', panels: 2 },
				split('y', [
					split('x', [cell(shelves(3)), cell(shelves(3)), cell(shelves(3))]),
					{
						size: 700,
						node: split('x', [
							cell(shelves(1), { hinge: 'left' }),
							cell(shelves(1), { hinge: 'left' }),
							cell(shelves(1), { hinge: 'right' }),
						]),
					},
				]),
			),
	},
	{
		id: 'dresserClassic',
		furnitureType: 'dresser',
		build: () =>
			doc(
				{ width: 900, height: 850, depth: 450 },
				60,
				{ body: 'walnut', fronts: 'walnut' },
				{ type: 'open', panels: 2 },
				cell(drawers(4)),
			),
	},
	{
		id: 'dresserWide',
		furnitureType: 'dresser',
		build: () =>
			doc(
				{ width: 1400, height: 800, depth: 450 },
				60,
				{ body: 'graphite', fronts: 'oak' },
				{ type: 'open', panels: 2 },
				split('x', [cell(drawers(3)), cell(drawers(3))]),
			),
	},
	{
		id: 'tvStand',
		furnitureType: 'dresser',
		build: () =>
			doc(
				{ width: 1800, height: 500, depth: 400 },
				40,
				{ body: 'oak', fronts: 'sage' },
				{ type: 'open', panels: 2 },
				split('x', [cell(drawers(2)), cell(shelves(1)), cell(drawers(2))]),
			),
	},
]

export function getTemplate(id: string): DesignTemplate | undefined {
	return DESIGN_TEMPLATES.find((template) => template.id === id)
}
