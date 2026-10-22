import {
	BACK,
	type DesignDocument,
	FRONT,
	FRONT_GAP,
	type Hinge,
	PANEL,
	SHELF_INSET,
} from './document'
import { computeLayout, frontRect, isBehindFronts, type Layout, type Rect } from './layout'

/** Axis-aligned box in mm: min corner + size; z grows from the back panel to the front. */
export type Box = { x: number; y: number; z: number; w: number; h: number; d: number }

export type PartMaterial = 'body' | 'fronts' | 'back' | 'metal' | 'inner'

export type PartKind =
	| 'carcass'
	| 'back'
	| 'plinth'
	| 'divider'
	| 'shelf'
	| 'rod'
	| 'drawer'
	| 'door'
	| 'sliding'

/** How a front moves when the model is shown open. */
export type PartMotion =
	| { type: 'hinge'; pivotX: number; pivotZ: number; direction: 1 | -1 }
	| { type: 'slide'; distance: number }
	| { type: 'fade' }

export type Part = {
	key: string
	kind: PartKind
	material: PartMaterial
	box: Box
	/** Layout node the part belongs to, for selection */
	nodeId?: string
	handle?: Box
	/** Drawer tray that travels with the front */
	tray?: Box
	motion?: PartMotion
}

const ROD_DROP = 60
const ROD_RADIUS = 12
const HANDLE_DEPTH = 28
const HANDLE_THICKNESS = 12
const DRAWER_GAP = 3
const KICK_SETBACK = 50
const SLIDING_OVERLAP = 40

function box(rect: Rect, z: number, d: number): Box {
	return { x: rect.x, y: rect.y, z, w: rect.w, h: rect.h, d }
}

function carcass(doc: DesignDocument, layout: Layout): Part[] {
	const { width: w, height: h, depth: d } = doc.size
	const { interior } = layout
	const inner = w - 2 * PANEL
	const parts: Part[] = [
		{
			key: 'side-left',
			kind: 'carcass',
			material: 'body',
			box: { x: 0, y: 0, z: 0, w: PANEL, h, d },
		},
		{
			key: 'side-right',
			kind: 'carcass',
			material: 'body',
			box: { x: w - PANEL, y: 0, z: 0, w: PANEL, h, d },
		},
		{
			key: 'top',
			kind: 'carcass',
			material: 'body',
			box: { x: PANEL, y: h - PANEL, z: 0, w: inner, h: PANEL, d },
		},
		{
			key: 'bottom',
			kind: 'carcass',
			material: 'body',
			box: { x: PANEL, y: doc.plinth, z: 0, w: inner, h: PANEL, d },
		},
		{
			key: 'back',
			kind: 'back',
			material: 'back',
			box: { x: PANEL, y: interior.y, z: 0, w: inner, h: interior.h, d: BACK },
		},
	]
	if (doc.plinth > 0) {
		parts.push({
			key: 'plinth',
			kind: 'plinth',
			material: 'body',
			box: { x: PANEL, y: 0, z: d - KICK_SETBACK - PANEL, w: inner, h: doc.plinth, d: PANEL },
		})
	}
	return parts
}

function verticalHandle(front: Rect, side: 'left' | 'right', z: number): Box {
	const length = Math.min(200, front.h * 0.35)
	// Tall doors get the handle at arm height, low ones in the middle
	const centre =
		front.h > 1200
			? Math.min(Math.max(1050, front.y + length), front.y + front.h - length)
			: front.y + front.h / 2
	const x = side === 'left' ? front.x + 40 : front.x + front.w - 40 - HANDLE_THICKNESS
	return { x, y: centre - length / 2, z, w: HANDLE_THICKNESS, h: length, d: HANDLE_DEPTH }
}

function doorLeaves(front: Rect, hinge: Hinge): { rect: Rect; hinge: 'left' | 'right' }[] {
	if (hinge !== 'double') return [{ rect: front, hinge }]
	const half = (front.w - FRONT_GAP) / 2
	return [
		{ rect: { ...front, w: half }, hinge: 'left' },
		{ rect: { ...front, x: front.x + half + FRONT_GAP, w: half }, hinge: 'right' },
	]
}

function doors(doc: DesignDocument, layout: Layout): Part[] {
	const depth = doc.size.depth
	if (doc.facade.type === 'sliding') {
		const count = doc.facade.panels
		const region: Rect = { x: 0, y: doc.plinth, w: doc.size.width, h: doc.size.height - doc.plinth }
		const panelWidth = (region.w + (count - 1) * SLIDING_OVERLAP) / count
		return Array.from({ length: count }, (_, index) => ({
			key: `sliding-${index}`,
			kind: 'sliding' as const,
			material: 'fronts' as const,
			box: {
				x: region.x + index * (panelWidth - SLIDING_OVERLAP),
				y: region.y + FRONT_GAP,
				// Two rails: even panels run on the outer one
				z: depth + (index % 2 === 0 ? FRONT + 8 : 2),
				w: panelWidth,
				h: region.h - FRONT_GAP * 2,
				d: FRONT,
			},
			motion: { type: 'fade' as const },
		}))
	}
	if (doc.facade.type !== 'hinged') return []

	const parts: Part[] = []
	for (const id of layout.order) {
		const entry = layout.nodes.get(id)
		if (!entry?.node.door) continue
		const front = frontRect(doc, layout, entry.rect, FRONT_GAP)
		for (const [index, leaf] of doorLeaves(front, entry.node.door.hinge).entries()) {
			const pivotX = leaf.hinge === 'left' ? leaf.rect.x : leaf.rect.x + leaf.rect.w
			parts.push({
				key: `door-${id}-${index}`,
				kind: 'door',
				material: 'fronts',
				nodeId: id,
				box: box(leaf.rect, depth, FRONT),
				handle: verticalHandle(leaf.rect, leaf.hinge === 'left' ? 'right' : 'left', depth + FRONT),
				motion: { type: 'hinge', pivotX, pivotZ: depth, direction: leaf.hinge === 'left' ? -1 : 1 },
			})
		}
	}
	return parts
}

function fills(doc: DesignDocument, layout: Layout): Part[] {
	const depth = doc.size.depth
	const parts: Part[] = []

	for (const divider of layout.dividers) {
		parts.push({
			key: `divider-${divider.splitId}-${divider.rect.x}-${divider.rect.y}`,
			kind: 'divider',
			material: 'body',
			nodeId: divider.splitId,
			box: box(divider.rect, BACK, depth - BACK),
		})
	}

	for (const id of layout.order) {
		const entry = layout.nodes.get(id)
		if (entry?.node.kind !== 'cell') continue
		const { rect } = entry
		const fill = entry.node.fill

		if (fill.type === 'shelves') {
			const gap = (rect.h - fill.count * PANEL) / (fill.count + 1)
			for (let index = 0; index < fill.count; index++) {
				const y = rect.y + rect.h - (index + 1) * gap - (index + 1) * PANEL
				parts.push({
					key: `shelf-${id}-${index}`,
					kind: 'shelf',
					material: 'body',
					nodeId: id,
					box: { x: rect.x, y, z: BACK, w: rect.w, h: PANEL, d: depth - BACK - SHELF_INSET },
				})
			}
		}

		if (fill.type === 'rod') {
			parts.push({
				key: `rod-${id}`,
				kind: 'rod',
				material: 'metal',
				nodeId: id,
				box: {
					x: rect.x,
					y: rect.y + rect.h - ROD_DROP - ROD_RADIUS,
					z: (BACK + depth) / 2 - ROD_RADIUS,
					w: rect.w,
					h: ROD_RADIUS * 2,
					d: ROD_RADIUS * 2,
				},
			})
		}

		if (fill.type === 'drawers') {
			const inside = isBehindFronts(doc, layout, id)
			const area = inside ? rect : frontRect(doc, layout, rect, 0)
			const frontZ = inside ? depth - SHELF_INSET - FRONT : depth
			const pitch = area.h / fill.count
			for (let index = 0; index < fill.count; index++) {
				const front: Rect = {
					x: area.x + DRAWER_GAP / 2,
					y: area.y + area.h - (index + 1) * pitch + DRAWER_GAP / 2,
					w: area.w - DRAWER_GAP,
					h: pitch - DRAWER_GAP,
				}
				const handleWidth = Math.min(Math.max(front.w / 3, 96), 320)
				parts.push({
					key: `drawer-${id}-${index}`,
					kind: 'drawer',
					material: inside ? 'body' : 'fronts',
					nodeId: id,
					box: box(front, frontZ, FRONT),
					handle: {
						x: front.x + (front.w - handleWidth) / 2,
						y: front.y + front.h - Math.min(60, front.h / 3),
						z: frontZ + FRONT,
						w: handleWidth,
						h: HANDLE_THICKNESS,
						d: HANDLE_DEPTH,
					},
					tray: {
						x: rect.x + 13,
						y: front.y + 20,
						z: BACK + 30,
						w: rect.w - 26,
						h: Math.max(front.h - 60, 40),
						d: frontZ - BACK - 30,
					},
					motion: { type: 'slide', distance: Math.min((depth - BACK) * 0.6, 450) },
				})
			}
		}
	}
	return parts
}

export function buildParts(doc: DesignDocument, layout: Layout = computeLayout(doc)): Part[] {
	return [...carcass(doc, layout), ...fills(doc, layout), ...doors(doc, layout)]
}
