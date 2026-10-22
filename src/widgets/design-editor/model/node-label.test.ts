import { describe, expect, it } from 'vitest'
import type { LayoutNode } from '@/entities/furniture'
import { indexPath } from './node-label'

const tree: LayoutNode = {
	id: 'root',
	kind: 'split',
	axis: 'x',
	door: null,
	children: [
		{ size: null, node: { id: 'a', kind: 'cell', fill: { type: 'empty' }, door: null } },
		{
			size: null,
			node: {
				id: 'b',
				kind: 'split',
				axis: 'y',
				door: null,
				children: [
					{ size: null, node: { id: 'b1', kind: 'cell', fill: { type: 'rod' }, door: null } },
					{ size: null, node: { id: 'b2', kind: 'cell', fill: { type: 'rod' }, door: null } },
				],
			},
		},
	],
}

describe('indexPath', () => {
	it('finds nested positions', () => {
		expect(indexPath(tree, 'root')).toEqual([])
		expect(indexPath(tree, 'b2')).toEqual([1, 1])
		expect(indexPath(tree, 'missing')).toBeNull()
	})
})
