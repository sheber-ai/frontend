import { useCallback, useReducer } from 'react'
import { type DesignDocument, findNode } from '@/entities/furniture'

const HISTORY_LIMIT = 100
/** Consecutive edits with the same key (slider drag, typing) merge into one undo step. */
const MERGE_WINDOW_MS = 1000

type State = {
	past: DesignDocument[]
	present: DesignDocument
	future: DesignDocument[]
	selectedId: string | null
	lastKey: string | null
	lastAt: number
}

type Action =
	| { type: 'apply'; update: (doc: DesignDocument) => DesignDocument; key?: string; at: number }
	| { type: 'undo' }
	| { type: 'redo' }
	| { type: 'select'; id: string | null }

function keepSelection(doc: DesignDocument, id: string | null): string | null {
	return id && findNode(doc.layout, id) ? id : null
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'apply': {
			const next = action.update(state.present)
			if (next === state.present) return state
			const merge =
				action.key !== undefined &&
				action.key === state.lastKey &&
				action.at - state.lastAt < MERGE_WINDOW_MS
			return {
				past: merge ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
				present: next,
				future: [],
				selectedId: keepSelection(next, state.selectedId),
				lastKey: action.key ?? null,
				lastAt: action.at,
			}
		}
		case 'undo': {
			const previous = state.past.at(-1)
			if (!previous) return state
			return {
				...state,
				past: state.past.slice(0, -1),
				present: previous,
				future: [state.present, ...state.future],
				selectedId: keepSelection(previous, state.selectedId),
				lastKey: null,
			}
		}
		case 'redo': {
			const [next, ...future] = state.future
			if (!next) return state
			return {
				...state,
				past: [...state.past, state.present],
				present: next,
				future,
				selectedId: keepSelection(next, state.selectedId),
				lastKey: null,
			}
		}
		case 'select':
			return { ...state, selectedId: action.id }
	}
}

export function useEditorState(initial: DesignDocument) {
	const [state, dispatch] = useReducer(reducer, {
		past: [],
		present: initial,
		future: [],
		selectedId: null,
		lastKey: null,
		lastAt: 0,
	})

	const apply = useCallback(
		(update: (doc: DesignDocument) => DesignDocument, key?: string) =>
			dispatch({ type: 'apply', update, key, at: Date.now() }),
		[],
	)
	const undo = useCallback(() => dispatch({ type: 'undo' }), [])
	const redo = useCallback(() => dispatch({ type: 'redo' }), [])
	const select = useCallback((id: string | null) => dispatch({ type: 'select', id }), [])

	return {
		document: state.present,
		selectedId: state.selectedId,
		canUndo: state.past.length > 0,
		canRedo: state.future.length > 0,
		apply,
		undo,
		redo,
		select,
	}
}

export type EditorState = ReturnType<typeof useEditorState>
