import { describe, expect, it } from 'vitest'
import { type DesignDocument, handleType, parseDocument } from './document'
import { setHandles } from './operations'
import { buildParts } from './parts'
import { getTemplate } from './templates'

const base = (): DesignDocument => {
	const template = getTemplate('wardrobeHinged')
	if (!template) throw new Error('template missing')
	return template.build()
}

const handles = (doc: DesignDocument) =>
	buildParts(doc).flatMap((part) => (part.handle ? [part.handle] : []))

describe('handles', () => {
	it('treats documents saved before the option existed as bar handles', () => {
		const old = base()
		expect(old.hardware).toBeUndefined()
		expect(handleType(old)).toBe('bar')
		expect(handleType(parseDocument({ ...old, hardware: null }))).toBe('bar')
	})

	it('changes the geometry: bars, small knobs or nothing at all', () => {
		const bars = handles(base())
		const knobs = handles(setHandles(base(), 'knob'))
		expect(bars.length).toBeGreaterThan(0)
		expect(knobs).toHaveLength(bars.length)
		expect(knobs.every((knob) => knob.w === knob.h)).toBe(true)
		expect(bars.some((bar) => bar.w !== bar.h)).toBe(true)
		expect(handles(setHandles(base(), 'none'))).toHaveLength(0)
	})

	it('keeps the choice in the saved document', () => {
		const saved = JSON.parse(JSON.stringify(setHandles(base(), 'none')))
		expect(handleType(parseDocument(saved))).toBe('none')
	})
})
