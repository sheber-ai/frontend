import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DesignDocument } from '@/entities/furniture'
import {
	getGetDesignQueryKey,
	getListDesignsQueryKey,
	useUpdateDesign,
} from '@/shared/api/generated/endpoints/designs/designs'

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error'

type Draft = { title: string; document: DesignDocument }

const DELAY_MS = 900
const serialize = (draft: Draft) => JSON.stringify(draft)

/** Saves the draft a moment after the last change; `flush` saves right away (before publishing). */
export function useAutosave(designId: string, draft: Draft) {
	const queryClient = useQueryClient()
	const { mutateAsync } = useUpdateDesign()
	const [status, setStatus] = useState<SaveStatus>('saved')
	const latest = useRef(draft)
	const saved = useRef(serialize(draft))
	latest.current = draft

	const flush = useCallback(async (): Promise<boolean> => {
		const payload = latest.current
		const key = serialize(payload)
		if (key === saved.current) {
			setStatus('saved')
			return true
		}
		setStatus('saving')
		try {
			const data = await mutateAsync({
				designId,
				data: { title: payload.title.trim() || undefined, document: payload.document },
			})
			saved.current = key
			queryClient.setQueryData(getGetDesignQueryKey(designId), data)
			void queryClient.invalidateQueries({ queryKey: getListDesignsQueryKey() })
			setStatus(serialize(latest.current) === key ? 'saved' : 'pending')
			return true
		} catch {
			setStatus('error')
			return false
		}
	}, [designId, mutateAsync, queryClient])

	const key = serialize(draft)
	useEffect(() => {
		if (key === saved.current) return
		setStatus('pending')
		const timer = window.setTimeout(() => void flush(), DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [key, flush])

	useEffect(() => {
		if (status === 'saved') return
		const warn = (event: BeforeUnloadEvent) => event.preventDefault()
		window.addEventListener('beforeunload', warn)
		return () => window.removeEventListener('beforeunload', warn)
	}, [status])

	return { status, flush }
}
