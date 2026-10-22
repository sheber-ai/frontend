import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DESIGN_TEMPLATES, setSize } from '@/entities/furniture'
import { useEditorState } from './use-editor-state'

const initial = DESIGN_TEMPLATES[0]?.build()

describe('useEditorState', () => {
	it('undoes and redoes edits', () => {
		if (!initial) throw new Error('no template')
		const { result } = renderHook(() => useEditorState(initial))

		act(() => result.current.apply((doc) => setSize(doc, { width: 2000 })))
		act(() => result.current.undo())
		expect(result.current.document.size.width).toBe(initial.size.width)

		act(() => result.current.redo())
		expect(result.current.document.size.width).toBe(2000)
	})

	it('merges a slider drag into one step', () => {
		if (!initial) throw new Error('no template')
		const { result } = renderHook(() => useEditorState(initial))

		for (const width of [1900, 2000, 2100]) {
			act(() => result.current.apply((doc) => setSize(doc, { width }), 'width'))
		}
		act(() => result.current.undo())

		expect(result.current.document.size.width).toBe(initial.size.width)
		expect(result.current.canUndo).toBe(false)
	})
})
