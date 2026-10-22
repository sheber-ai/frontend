import { type DesignDocument, FRONT_GAP, PANEL } from './document'
import { computeLayout, frontRect, type Layout } from './layout'

export type IssueLevel = 'error' | 'warning'

export type IssueCode =
	| 'splitOverflow'
	| 'cellTooSmall'
	| 'shelfTooLong'
	| 'shelvesTooDense'
	| 'rodTooLow'
	| 'rodTooLong'
	| 'drawerTooNarrow'
	| 'drawerTooWide'
	| 'drawerTooLow'
	| 'doorTooWide'
	| 'doorTooNarrow'
	| 'slidingTooNarrow'
	| 'slidingTooWide'
	| 'slidingTooShallow'

/** `params` feed the translation: issues.<code> */
export type Issue = {
	code: IssueCode
	level: IssueLevel
	nodeId: string | null
	params?: Record<string, number>
}

export const RULES = {
	minCellWidth: 150,
	minCellHeight: 100,
	maxShelfSpan: 900,
	minShelfGap: 120,
	minRodHeight: 800,
	maxRodSpan: 1200,
	minDrawerWidth: 250,
	maxDrawerWidth: 1000,
	minDrawerHeight: 100,
	maxDoorWidth: 650,
	minDoorWidth: 200,
	minSlidingWidth: 450,
	maxSlidingWidth: 1200,
	minSlidingDepth: 450,
} as const

export function validateDocument(
	doc: DesignDocument,
	layout: Layout = computeLayout(doc),
): Issue[] {
	const issues: Issue[] = []
	const add = (
		code: IssueCode,
		level: IssueLevel,
		nodeId: string | null,
		params?: Issue['params'],
	) => issues.push({ code, level, nodeId, params })

	for (const id of layout.overflow) add('splitOverflow', 'error', id)

	for (const id of layout.order) {
		const entry = layout.nodes.get(id)
		if (!entry) continue
		const { rect, node } = entry

		if (node.door && doc.facade.type === 'hinged') {
			const front = frontRect(doc, layout, rect, FRONT_GAP)
			const leaf = node.door.hinge === 'double' ? front.w / 2 : front.w
			if (leaf > RULES.maxDoorWidth) add('doorTooWide', 'warning', id, { max: RULES.maxDoorWidth })
			if (leaf < RULES.minDoorWidth) add('doorTooNarrow', 'error', id, { min: RULES.minDoorWidth })
		}

		if (node.kind !== 'cell') continue
		if (rect.w < RULES.minCellWidth - 0.5 || rect.h < RULES.minCellHeight - 0.5) {
			add('cellTooSmall', 'error', id, { width: RULES.minCellWidth, height: RULES.minCellHeight })
			continue
		}

		const fill = node.fill
		if (fill.type === 'shelves') {
			if (rect.w > RULES.maxShelfSpan)
				add('shelfTooLong', 'warning', id, { max: RULES.maxShelfSpan })
			const gap = (rect.h - fill.count * PANEL) / (fill.count + 1)
			if (gap < RULES.minShelfGap) add('shelvesTooDense', 'error', id, { min: RULES.minShelfGap })
		}
		if (fill.type === 'rod') {
			if (rect.h < RULES.minRodHeight) add('rodTooLow', 'warning', id, { min: RULES.minRodHeight })
			if (rect.w > RULES.maxRodSpan) add('rodTooLong', 'warning', id, { max: RULES.maxRodSpan })
		}
		if (fill.type === 'drawers') {
			if (rect.w < RULES.minDrawerWidth)
				add('drawerTooNarrow', 'error', id, { min: RULES.minDrawerWidth })
			if (rect.w > RULES.maxDrawerWidth)
				add('drawerTooWide', 'warning', id, { max: RULES.maxDrawerWidth })
			if (rect.h / fill.count < RULES.minDrawerHeight)
				add('drawerTooLow', 'error', id, { min: RULES.minDrawerHeight })
		}
	}

	if (doc.facade.type === 'sliding') {
		const panel = doc.size.width / doc.facade.panels
		if (panel < RULES.minSlidingWidth)
			add('slidingTooNarrow', 'error', null, { min: RULES.minSlidingWidth })
		if (panel > RULES.maxSlidingWidth)
			add('slidingTooWide', 'warning', null, { max: RULES.maxSlidingWidth })
		if (doc.size.depth < RULES.minSlidingDepth)
			add('slidingTooShallow', 'warning', null, { min: RULES.minSlidingDepth })
	}

	return issues
}

export function hasErrors(issues: Issue[]): boolean {
	return issues.some((issue) => issue.level === 'error')
}
