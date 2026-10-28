import { describe, expect, it } from 'vitest'
import { acceptFor, formatFileSize, moveId, precheckFile } from './precheck'

const LIMIT = { allowPdf: false, maxBytes: 1000, maxFiles: 3 }

describe('precheckFile', () => {
	it('accepts images within the limits', () => {
		expect(precheckFile({ type: 'image/jpeg', size: 500 }, LIMIT, 0)).toBeNull()
	})

	it('rejects wrong types, big files and extra files', () => {
		expect(precheckFile({ type: 'application/pdf', size: 10 }, LIMIT, 0)).toBe(
			'file_type_not_allowed',
		)
		expect(precheckFile({ type: 'image/heic', size: 10 }, LIMIT, 0)).toBe('file_type_not_allowed')
		expect(precheckFile({ type: 'image/png', size: 1001 }, LIMIT, 0)).toBe('file_too_large')
		expect(precheckFile({ type: 'image/png', size: 10 }, LIMIT, 3)).toBe('too_many_files')
	})

	it('lets a single-file slot be replaced and PDFs where allowed', () => {
		expect(precheckFile({ type: 'image/png', size: 10 }, { ...LIMIT, maxFiles: 1 }, 1)).toBeNull()
		expect(
			precheckFile({ type: 'application/pdf', size: 10 }, { ...LIMIT, allowPdf: true }, 0),
		).toBeNull()
		expect(acceptFor({ allowPdf: true })).toContain('application/pdf')
	})
})

describe('helpers', () => {
	it('formats sizes', () => {
		expect(formatFileSize(512, 'en')).toBe('512 B')
		expect(formatFileSize(1536 * 1024, 'en')).toBe('1.5 MB')
		expect(formatFileSize(5 * 1024 * 1024, 'ru')).toBe('5 МБ')
	})

	it('moves ids within bounds', () => {
		expect(moveId(['a', 'b', 'c'], 'c', Number.NEGATIVE_INFINITY)).toEqual(['c', 'a', 'b'])
		expect(moveId(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c'])
		expect(moveId(['a', 'b', 'c'], 'a', 1)).toEqual(['b', 'a', 'c'])
	})
})
