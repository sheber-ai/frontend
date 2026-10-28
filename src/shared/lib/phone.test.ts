import { describe, expect, it } from 'vitest'
import {
	canGrowPhone,
	caretAfter,
	formatPhone,
	isValidPhone,
	nextPhoneValue,
	normalizePhone,
	significantBefore,
} from './phone'

describe('normalizePhone', () => {
	it.each([
		['+7 (701) 123-45-67', '+77011234567'],
		['8 701 123 45 67', '+77011234567'],
		['87011234567', '+77011234567'],
		['7011234567', '+77011234567'],
		['7 701 123 45 67', '+77011234567'],
		['+996 555 123 456', '+996555123456'],
		['+1 (202) 555-0123', '+12025550123'],
		['', ''],
		['+', '+'],
		['abc', ''],
	])('%s -> %s', (raw, expected) => {
		expect(normalizePhone(raw)).toBe(expected)
	})

	it('keeps at most 15 digits', () => {
		expect(normalizePhone('+1234567890123456789')).toBe('+123456789012345')
	})
})

describe('formatPhone', () => {
	it('groups +7 numbers the local way, also while incomplete', () => {
		expect(formatPhone('+77011234567')).toBe('+7 701 123 45 67')
		expect(formatPhone('+77011')).toBe('+7 701 1')
		expect(formatPhone('+7')).toBe('+7')
	})

	it('formats other countries by their own rules', () => {
		expect(formatPhone('+996555123456')).toBe('+996 555 123 456')
		expect(formatPhone('+12025550123')).toBe('+1 202 555 0123')
	})

	it('leaves values it cannot parse untouched', () => {
		expect(formatPhone('123')).toBe('123')
		expect(formatPhone('')).toBe('')
	})
})

describe('validation and limits', () => {
	it('accepts only complete, existing numbers', () => {
		expect(isValidPhone('+77011234567')).toBe(true)
		expect(isValidPhone('+996555123456')).toBe(true)
		expect(isValidPhone('+7701123456')).toBe(false)
		expect(isValidPhone('+77991234567')).toBe(false)
		expect(isValidPhone('')).toBe(false)
	})

	it('refuses digits past a complete number but always allows deleting', () => {
		expect(canGrowPhone('+77011234567', '+770112345678')).toBe(false)
		expect(canGrowPhone('+7701123456', '+77011234567')).toBe(true)
		expect(canGrowPhone('+77011234567', '+7701123456')).toBe(true)
		expect(canGrowPhone('+77011234567', '+996555123456')).toBe(true)
	})

	it('ignores the trunk 8 typed after the prefilled +7', () => {
		expect(nextPhoneValue('+7', '+78')).toBe('+7')
		expect(nextPhoneValue('+7', '+77')).toBe('+77')
		expect(nextPhoneValue('+77011234567', '+770112345678')).toBeNull()
	})
})

describe('caret helpers', () => {
	it('counts digits and plus regardless of separators', () => {
		expect(significantBefore('+7 701 123', 6)).toBe(5)
		expect(caretAfter('+7 701 123', 5)).toBe(6)
		expect(caretAfter('+7 701 123', 0)).toBe(0)
		expect(caretAfter('+7 701 123', 99)).toBe(10)
	})
})
