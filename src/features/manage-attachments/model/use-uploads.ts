import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { API_PATHS, getErrorCode, invalidatePaths } from '@/shared/api'
import { uploadAttachment } from '@/shared/api/generated/endpoints/attachments/attachments'
import type { AttachmentLimitSchema, AttachmentPurposeEnum } from '@/shared/api/generated/model'
import { precheckFile } from '../lib/precheck'

export type AttachmentTarget = { designId?: string; orderId?: string }

export type Upload = {
	id: string
	file: File
	/** Object URL of an image for the preview, null for documents */
	preview: string | null
	progress: number
	status: 'uploading' | 'error'
	error?: string
}

type Options = {
	purpose: AttachmentPurposeEnum
	target: AttachmentTarget
	limit: AttachmentLimitSchema | undefined
	/** Files already attached for this purpose */
	existing: number
}

/** Upload queue: previews, progress, client-side checks, retry. Finished files leave the queue. */
export function useUploads({ purpose, target, limit, existing }: Options) {
	const queryClient = useQueryClient()
	const [uploads, setUploads] = useState<Upload[]>([])
	const previews = useRef(new Set<string>())
	// One upload at a time: files keep the order they were picked in, the network is not flooded
	const queue = useRef<Promise<void>>(Promise.resolve())

	useEffect(() => {
		const urls = previews.current
		return () => {
			for (const url of urls) URL.revokeObjectURL(url)
		}
	}, [])

	const patch = useCallback((id: string, change: Partial<Upload>) => {
		setUploads((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)))
	}, [])

	const drop = useCallback((id: string) => {
		setUploads((current) => {
			const gone = current.find((item) => item.id === id)
			if (gone?.preview) {
				URL.revokeObjectURL(gone.preview)
				previews.current.delete(gone.preview)
			}
			return current.filter((item) => item.id !== id)
		})
	}, [])

	const send = useCallback(
		async (upload: Upload) => {
			patch(upload.id, { status: 'uploading', progress: 0, error: undefined })
			try {
				await uploadAttachment(
					{ file: upload.file, purpose, designId: target.designId, orderId: target.orderId },
					{
						onUploadProgress: (event) => {
							if (event.total) patch(upload.id, { progress: event.loaded / event.total })
						},
					},
				)
				await invalidatePaths(queryClient, API_PATHS.attachments)
				drop(upload.id)
			} catch (error) {
				patch(upload.id, { status: 'error', error: getErrorCode(error) })
			}
		},
		[purpose, target.designId, target.orderId, patch, drop, queryClient],
	)

	const add = useCallback(
		(files: File[]) => {
			if (!limit) return
			let taken = existing + uploads.filter((item) => item.status === 'uploading').length
			const created: Upload[] = files.map((file) => {
				const error = precheckFile(file, limit, taken)
				if (!error) taken++
				const preview = !error && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
				if (preview) previews.current.add(preview)
				return {
					id: crypto.randomUUID(),
					file,
					preview,
					progress: 0,
					status: error ? 'error' : 'uploading',
					error: error ?? undefined,
				}
			})
			setUploads((current) => [...current, ...created])
			for (const upload of created) {
				if (upload.status !== 'uploading') continue
				queue.current = queue.current.then(() => send(upload))
			}
		},
		[limit, existing, uploads, send],
	)

	const retry = useCallback(
		(id: string) => {
			const upload = uploads.find((item) => item.id === id)
			if (upload) void send(upload)
		},
		[uploads, send],
	)

	return { uploads, add, retry, dismiss: drop }
}
