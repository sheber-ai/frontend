import type { TFunction } from 'i18next'
import type { LayoutNode } from '@/entities/furniture'

/** Child indexes from the root, e.g. [1, 0] for the first part of the second section. */
export function indexPath(root: LayoutNode, id: string): number[] | null {
	if (root.id === id) return []
	if (root.kind === 'cell') return null
	for (const [index, child] of root.children.entries()) {
		const rest = indexPath(child.node, id)
		if (rest) return [index, ...rest]
	}
	return null
}

/** "Корпус" for the root, "Секция 2.1" for nested nodes. */
export function nodeLabel(t: TFunction, root: LayoutNode, id: string): string {
	const path = indexPath(root, id)
	if (!path || path.length === 0) return t('editor.section.body')
	return t('editor.section.name', { index: path.map((index) => index + 1).join('.') })
}
