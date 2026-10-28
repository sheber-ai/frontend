import type { HandleType } from './document'
import {
	type Axis,
	type CellNode,
	type DesignDocument,
	type Door,
	type FacadeType,
	type Fill,
	type LayoutNode,
	LIMITS,
	type Size,
	type SplitNode,
} from './document'

// Pure edits of a document: each returns a new document and never mutates the input.

export function newNodeId(): string {
	return Math.random().toString(36).slice(2, 10)
}

export function cell(fill: Fill = { type: 'empty' }, door: Door | null = null): CellNode {
	return { id: newNodeId(), kind: 'cell', fill, door }
}

export function split(
	axis: Axis,
	children: (LayoutNode | { size: number | null; node: LayoutNode })[],
	door: Door | null = null,
): SplitNode {
	return {
		id: newNodeId(),
		kind: 'split',
		axis,
		door,
		children: children.map((child) => ('node' in child ? child : { size: null, node: child })),
	}
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(Math.round(value), min), max)

export function findNode(root: LayoutNode, id: string): LayoutNode | null {
	if (root.id === id) return root
	if (root.kind === 'cell') return null
	for (const child of root.children) {
		const found = findNode(child.node, id)
		if (found) return found
	}
	return null
}

export function findParent(root: LayoutNode, id: string): SplitNode | null {
	if (root.kind === 'cell') return null
	for (const child of root.children) {
		if (child.node.id === id) return root
		const found = findParent(child.node, id)
		if (found) return found
	}
	return null
}

/** Root-to-node chain of ids. */
export function pathTo(root: LayoutNode, id: string): string[] {
	if (root.id === id) return [id]
	if (root.kind === 'cell') return []
	for (const child of root.children) {
		const path = pathTo(child.node, id)
		if (path.length) return [root.id, ...path]
	}
	return []
}

function mapNode(
	root: LayoutNode,
	id: string,
	update: (node: LayoutNode) => LayoutNode,
): LayoutNode {
	if (root.id === id) return update(root)
	if (root.kind === 'cell') return root
	return {
		...root,
		children: root.children.map((child) => ({ ...child, node: mapNode(child.node, id, update) })),
	}
}

function withLayout(doc: DesignDocument, layout: LayoutNode): DesignDocument {
	return { ...doc, layout }
}

function stripDoors(node: LayoutNode): LayoutNode {
	if (node.kind === 'cell') return node.door ? { ...node, door: null } : node
	return {
		...node,
		door: null,
		children: node.children.map((child) => ({ ...child, node: stripDoors(child.node) })),
	}
}

export function setSize(doc: DesignDocument, patch: Partial<Size>): DesignDocument {
	const size = { ...doc.size, ...patch }
	return {
		...doc,
		size: {
			width: clamp(size.width, LIMITS.width.min, LIMITS.width.max),
			height: clamp(size.height, LIMITS.height.min, LIMITS.height.max),
			depth: clamp(size.depth, LIMITS.depth.min, LIMITS.depth.max),
		},
	}
}

export function setPlinth(doc: DesignDocument, plinth: number): DesignDocument {
	return { ...doc, plinth: clamp(plinth, LIMITS.plinth.min, LIMITS.plinth.max) }
}

export function setMaterials(
	doc: DesignDocument,
	patch: Partial<DesignDocument['materials']>,
): DesignDocument {
	return { ...doc, materials: { ...doc.materials, ...patch } }
}

export function setHandles(doc: DesignDocument, handles: HandleType): DesignDocument {
	return { ...doc, hardware: { ...doc.hardware, handles } }
}

export function setFacade(
	doc: DesignDocument,
	type: FacadeType,
	panels = doc.facade.panels,
): DesignDocument {
	return {
		...doc,
		facade: { type, panels: clamp(panels, LIMITS.slidingPanels.min, LIMITS.slidingPanels.max) },
	}
}

/** Splits a cell into `count` parts along `axis`; the parts inherit the fill, the door covers them all. */
export function divideCell(doc: DesignDocument, id: string, axis: Axis, count = 2): DesignDocument {
	const parts = clamp(count, LIMITS.children.min, LIMITS.children.max)
	return withLayout(
		doc,
		mapNode(doc.layout, id, (node) => {
			if (node.kind !== 'cell') return node
			const children = Array.from({ length: parts }, () => cell(structuredClone(node.fill)))
			return { ...split(axis, children, node.door), id: node.id }
		}),
	)
}

/** Appends an empty flexible section to a split. */
export function addSection(doc: DesignDocument, splitId: string): DesignDocument {
	return withLayout(
		doc,
		mapNode(doc.layout, splitId, (node) => {
			if (node.kind !== 'split' || node.children.length >= LIMITS.children.max) return node
			return { ...node, children: [...node.children, { size: null, node: cell() }] }
		}),
	)
}

/** Removes a node; a split left with one child collapses into that child. */
export function removeNode(doc: DesignDocument, id: string): DesignDocument {
	const parent = findParent(doc.layout, id)
	if (!parent) return doc
	return withLayout(
		doc,
		mapNode(doc.layout, parent.id, (node) => {
			if (node.kind !== 'split') return node
			const children = node.children.filter((child) => child.node.id !== id)
			if (!children.some((child) => child.size === null) && children.length > 0) {
				const last = children.length - 1
				children[last] = { ...children[last], size: null } as (typeof children)[number]
			}
			if (children.length > 1) return { ...node, children }
			const [only] = children
			if (!only) return node
			// Keep the split's id and door so the selection and the front survive
			return { ...only.node, id: node.id, door: node.door ?? only.node.door }
		}),
	)
}

/** Sets a child's size along the split axis; `null` makes it flexible. One child always stays flexible. */
export function setChildSize(
	doc: DesignDocument,
	splitId: string,
	index: number,
	size: number | null,
): DesignDocument {
	return withLayout(
		doc,
		mapNode(doc.layout, splitId, (node) => {
			if (node.kind !== 'split' || !node.children[index]) return node
			const value = size === null ? null : clamp(size, LIMITS.childSize.min, LIMITS.childSize.max)
			const children = node.children.map((child, childIndex) =>
				childIndex === index ? { ...child, size: value } : child,
			)
			if (!children.some((child) => child.size === null)) {
				const neighbour = index === children.length - 1 ? index - 1 : children.length - 1
				children[neighbour] = { ...children[neighbour], size: null } as (typeof children)[number]
			}
			return { ...node, children }
		}),
	)
}

export function setAxis(doc: DesignDocument, splitId: string, axis: Axis): DesignDocument {
	return withLayout(
		doc,
		mapNode(doc.layout, splitId, (node) =>
			node.kind === 'split'
				? { ...node, axis, children: node.children.map((child) => ({ ...child, size: null })) }
				: node,
		),
	)
}

export function setFill(doc: DesignDocument, id: string, fill: Fill): DesignDocument {
	return withLayout(
		doc,
		mapNode(doc.layout, id, (node) => (node.kind === 'cell' ? { ...node, fill } : node)),
	)
}

/** A door on a node replaces doors on its ancestors and descendants: fronts never overlap. */
export function setDoor(doc: DesignDocument, id: string, door: Door | null): DesignDocument {
	const ancestors = new Set(pathTo(doc.layout, id).slice(0, -1))
	const clearAncestors = (node: LayoutNode): LayoutNode => {
		if (node.kind === 'cell') return node
		return {
			...node,
			door: ancestors.has(node.id) ? null : node.door,
			children: node.children.map((child) => ({
				...child,
				node: ancestors.has(child.node.id) ? clearAncestors(child.node) : child.node,
			})),
		}
	}
	const cleared = ancestors.has(doc.layout.id) ? clearAncestors(doc.layout) : doc.layout
	return withLayout(
		doc,
		mapNode(cleared, id, (node) => ({ ...stripDoors(node), door })),
	)
}

/** Fresh ids for every node: used when a template becomes a new design. */
export function cloneWithNewIds(doc: DesignDocument): DesignDocument {
	const renew = (node: LayoutNode): LayoutNode =>
		node.kind === 'cell'
			? { ...node, id: newNodeId() }
			: {
					...node,
					id: newNodeId(),
					children: node.children.map((child) => ({ ...child, node: renew(child.node) })),
				}
	return { ...structuredClone(doc), layout: renew(doc.layout) }
}
