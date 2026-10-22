import { type Axis, type DesignDocument, type LayoutNode, PANEL, type SplitNode } from './document'

/** Front projection in mm: x to the right, y up from the floor. */
export type Rect = { x: number; y: number; w: number; h: number }

export type NodeLayout = {
	id: string
	node: LayoutNode
	rect: Rect
	parentId: string | null
	/** Position among the parent's children */
	index: number
	level: number
}

export type Divider = { splitId: string; axis: Axis; rect: Rect }

export type Layout = {
	outer: Rect
	interior: Rect
	nodes: Map<string, NodeLayout>
	/** Node ids in depth-first order */
	order: string[]
	dividers: Divider[]
	/** Splits whose fixed sizes leave flexible children less than MIN_FLEX_SIZE */
	overflow: Set<string>
}

export const MIN_FLEX_SIZE = 100
const EPS = 0.5

export function interiorRect(doc: DesignDocument): Rect {
	const { width, height } = doc.size
	const bottom = doc.plinth + PANEL
	return { x: PANEL, y: bottom, w: width - 2 * PANEL, h: height - PANEL - bottom }
}

/** Resolved child sizes along the split axis; `overflow` when fixed sizes do not fit. */
export function resolveSizes(split: SplitNode, available: number) {
	const sizes = split.children.map((child) => child.size)
	if (!sizes.includes(null)) sizes[sizes.length - 1] = null
	const flexCount = sizes.filter((size) => size === null).length
	const fixedTotal = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0)
	const room = available - flexCount * MIN_FLEX_SIZE
	const scale = fixedTotal > room && fixedTotal > 0 ? Math.max(room, 0) / fixedTotal : 1
	const flex = (available - fixedTotal * scale) / flexCount
	return {
		sizes: sizes.map((size) => (size === null ? flex : size * scale)),
		overflow: scale < 1 || flex < MIN_FLEX_SIZE - EPS,
	}
}

export function computeLayout(doc: DesignDocument): Layout {
	const interior = interiorRect(doc)
	const layout: Layout = {
		outer: { x: 0, y: 0, w: doc.size.width, h: doc.size.height },
		interior,
		nodes: new Map(),
		order: [],
		dividers: [],
		overflow: new Set(),
	}

	const place = (
		node: LayoutNode,
		rect: Rect,
		parentId: string | null,
		index: number,
		level: number,
	) => {
		layout.nodes.set(node.id, { id: node.id, node, rect, parentId, index, level })
		layout.order.push(node.id)
		if (node.kind === 'cell') return

		const along = node.axis === 'x' ? rect.w : rect.h
		const { sizes, overflow } = resolveSizes(node, along - PANEL * (node.children.length - 1))
		if (overflow) layout.overflow.add(node.id)

		// x runs left to right, y runs top to bottom
		let cursor = node.axis === 'x' ? rect.x : rect.y + rect.h
		node.children.forEach((child, childIndex) => {
			const size = sizes[childIndex] ?? 0
			const isLast = childIndex === node.children.length - 1
			if (node.axis === 'x') {
				place(
					child.node,
					{ x: cursor, y: rect.y, w: size, h: rect.h },
					node.id,
					childIndex,
					level + 1,
				)
				cursor += size
				if (!isLast) {
					layout.dividers.push({
						splitId: node.id,
						axis: 'x',
						rect: { x: cursor, y: rect.y, w: PANEL, h: rect.h },
					})
					cursor += PANEL
				}
			} else {
				cursor -= size
				place(
					child.node,
					{ x: rect.x, y: cursor, w: rect.w, h: size },
					node.id,
					childIndex,
					level + 1,
				)
				if (!isLast) {
					cursor -= PANEL
					layout.dividers.push({
						splitId: node.id,
						axis: 'y',
						rect: { x: rect.x, y: cursor, w: rect.w, h: PANEL },
					})
				}
			}
		})
	}

	place(doc.layout, interior, null, 0, 0)
	return layout
}

/**
 * Overlay front over a node: reaches half of an inner panel and all of an outer one,
 * so neighbouring fronts meet at panel centres.
 */
export function frontRect(doc: DesignDocument, layout: Layout, rect: Rect, gap: number): Rect {
	const { interior } = layout
	const left = rect.x <= interior.x + EPS ? 0 : rect.x - PANEL / 2
	const right =
		rect.x + rect.w >= interior.x + interior.w - EPS ? doc.size.width : rect.x + rect.w + PANEL / 2
	const bottom = rect.y <= interior.y + EPS ? doc.plinth : rect.y - PANEL / 2
	const top =
		rect.y + rect.h >= interior.y + interior.h - EPS ? doc.size.height : rect.y + rect.h + PANEL / 2
	return {
		x: left + gap / 2,
		y: bottom + gap / 2,
		w: right - left - gap,
		h: top - bottom - gap,
	}
}

/** Node with a door that covers this node (itself or the closest ancestor), if doors are in use. */
export function coveringDoorNode(
	doc: DesignDocument,
	layout: Layout,
	id: string,
): NodeLayout | null {
	if (doc.facade.type !== 'hinged') return null
	let current = layout.nodes.get(id)
	while (current) {
		if (current.node.door) return current
		current = current.parentId ? layout.nodes.get(current.parentId) : undefined
	}
	return null
}

export function isBehindFronts(doc: DesignDocument, layout: Layout, id: string): boolean {
	return doc.facade.type === 'sliding' || coveringDoorNode(doc, layout, id) !== null
}
