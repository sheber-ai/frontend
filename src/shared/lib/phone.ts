// "max" metadata validates digits, not only length: the same verdict as the backend (Python phonenumbers)
import {
	AsYouType,
	parsePhoneNumberFromString,
	validatePhoneNumberLength,
} from 'libphonenumber-js/max'

/** E.164 allows at most 15 digits after "+". */
export const PHONE_MAX_DIGITS = 15

/** What the field starts with: Kazakhstan is the default country. */
export const PHONE_DEFAULT_PREFIX = '+7'

const digitsOf = (text: string) => text.replace(/\D/g, '')

/**
 * Any user spelling to the stored shape: "+" and digits (E.164 once complete).
 * Without "+" the number is read as Kazakhstani: 8 701…, 7 701…, 701 123 45 67.
 */
export function normalizePhone(text: string): string {
	const trimmed = text.trim()
	const digits = digitsOf(trimmed)
	if (!digits) return trimmed.startsWith('+') ? '+' : ''
	let international: string
	if (trimmed.startsWith('+')) international = digits
	else if (digits.length === 10) international = `7${digits}`
	else if (digits[0] === '8') international = `7${digits.slice(1)}`
	else if (digits[0] === '7') international = digits
	else international = `7${digits}`
	return `+${international.slice(0, PHONE_MAX_DIGITS)}`
}

/** +7 numbers (Kazakhstan, Russia) in the local habit: +7 701 123 45 67. */
function formatPlusSeven(national: string): string {
	const groups = [
		national.slice(0, 3),
		national.slice(3, 6),
		national.slice(6, 8),
		national.slice(8, 10),
	]
	return ['+7', ...groups.filter(Boolean)].join(' ')
}

/** Readable form of a complete or partial number; anything unparsable is returned as is. */
export function formatPhone(value: string): string {
	if (!value.startsWith('+')) return value
	if (value.startsWith('+7')) return formatPlusSeven(digitsOf(value).slice(1))
	return new AsYouType().input(value)
}

export function isValidPhone(value: string): boolean {
	return parsePhoneNumberFromString(value)?.isValid() ?? false
}

/** Whether `next` may replace `previous` while typing: no digits past the longest possible number. */
export function canGrowPhone(previous: string, next: string): boolean {
	if (digitsOf(next).length <= digitsOf(previous).length) return true
	if (digitsOf(next).length > PHONE_MAX_DIGITS) return false
	// A different complete number (e.g. typed over a selection) is always fine
	if (isValidPhone(next)) return true
	if (isValidPhone(previous)) return false
	return validatePhoneNumberLength(next) !== 'TOO_LONG'
}

const isSignificant = (char: string | undefined) => char !== undefined && /[\d+]/.test(char)

/** How many digits and "+" stand before `index`: the caret position independent of spaces and brackets. */
export function significantBefore(text: string, index: number): number {
	let count = 0
	for (let i = 0; i < Math.min(index, text.length); i++) if (isSignificant(text[i])) count++
	return count
}

/** Index right after the `count`-th digit or "+" of the formatted text. */
export function caretAfter(formatted: string, count: number): number {
	if (count <= 0) return 0
	let seen = 0
	for (let i = 0; i < formatted.length; i++) {
		if (isSignificant(formatted[i])) seen++
		if (seen === count) return i + 1
	}
	return formatted.length
}

/** Index of the nearest digit before (`backward`) or at/after `index`, skipping spaces and brackets. */
export function nearestDigit(text: string, index: number, backward: boolean): number {
	if (backward) {
		for (let i = index - 1; i >= 0; i--) if (/\d/.test(text[i] ?? '')) return i
		return -1
	}
	for (let i = index; i < text.length; i++) if (/\d/.test(text[i] ?? '')) return i
	return -1
}

/**
 * The value after an edit, or null to reject it (too many digits).
 * Typing the habitual trunk "8" right after the prefilled "+7" is ignored.
 */
export function nextPhoneValue(previous: string, raw: string): string | null {
	const next = normalizePhone(raw)
	if (previous === PHONE_DEFAULT_PREFIX && next === `${PHONE_DEFAULT_PREFIX}8`) return previous
	return canGrowPhone(previous, next) ? next : null
}
