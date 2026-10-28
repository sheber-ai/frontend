import type { AttachmentLimitSchema } from '@/shared/api/generated/model'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const PDF_TYPE = 'application/pdf'

export type PrecheckError = 'file_type_not_allowed' | 'file_too_large' | 'too_many_files'

/** `accept` for the file input: what the server will take for this purpose. */
export function acceptFor(limit: Pick<AttachmentLimitSchema, 'allowPdf'>): string {
	return [...IMAGE_TYPES, ...(limit.allowPdf ? [PDF_TYPE] : [])].join(',')
}

/**
 * Catches obvious mistakes before uploading; the server checks the real content again.
 * `taken` counts files already attached and still uploading.
 */
export function precheckFile(
	file: Pick<File, 'type' | 'size'>,
	limit: Pick<AttachmentLimitSchema, 'allowPdf' | 'maxBytes' | 'maxFiles'>,
	taken: number,
): PrecheckError | null {
	const allowed: string[] = [...IMAGE_TYPES, ...(limit.allowPdf ? [PDF_TYPE] : [])]
	if (!allowed.includes(file.type)) return 'file_type_not_allowed'
	if (file.size > limit.maxBytes) return 'file_too_large'
	// A single-file slot (logo) is replaced, not filled up
	if (limit.maxFiles > 1 && taken >= limit.maxFiles) return 'too_many_files'
	return null
}

const UNITS: Record<string, readonly [string, string, string]> = {
	ru: ['Б', 'КБ', 'МБ'],
	kk: ['Б', 'КБ', 'МБ'],
}

/** 1 572 864 -> "1,5 МБ" */
export function formatFileSize(bytes: number, language: string): string {
	const units = UNITS[language] ?? (['B', 'KB', 'MB'] as const)
	let value = bytes
	let unit = 0
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024
		unit++
	}
	const number = new Intl.NumberFormat(language, {
		maximumFractionDigits: unit === 0 ? 0 : 1,
	}).format(value)
	return `${number} ${units[unit]}`
}

/** New order of ids after moving one item by `delta` (−1 left, +1 right, −Infinity to the front). */
export function moveId(ids: string[], id: string, delta: number): string[] {
	const from = ids.indexOf(id)
	if (from < 0) return ids
	const to = Math.max(0, Math.min(ids.length - 1, from + delta))
	if (to === from) return ids
	const next = ids.filter((item) => item !== id)
	next.splice(to, 0, id)
	return next
}
