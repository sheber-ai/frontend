import type { DesignDocument } from './document'
import { computeLayout, type Layout } from './layout'
import { buildParts, type Part } from './parts'

export type DesignSpecs = {
	/** Clear widths of the top-level sections, left to right */
	sections: number[]
	shelves: number
	rods: number
	drawers: number
	doors: number
	slidingPanels: number
}

export function summarizeDesign(
	doc: DesignDocument,
	layout: Layout = computeLayout(doc),
	parts: Part[] = buildParts(doc, layout),
): DesignSpecs {
	const root = layout.nodes.get(doc.layout.id)
	const sections =
		doc.layout.kind === 'split' && doc.layout.axis === 'x'
			? doc.layout.children.map((child) => Math.round(layout.nodes.get(child.node.id)?.rect.w ?? 0))
			: [Math.round(root?.rect.w ?? 0)]
	const count = (kind: Part['kind']) => parts.filter((part) => part.kind === kind).length
	return {
		sections,
		shelves:
			count('shelf') + count('divider') - layout.dividers.filter((d) => d.axis === 'x').length,
		rods: count('rod'),
		drawers: count('drawer'),
		doors: count('door'),
		slidingPanels: count('sliding'),
	}
}
