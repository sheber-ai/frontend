import type { TFunction } from 'i18next'

export const FORM_ERRORS = [
	'form.required',
	'form.invalid',
	'form.phone',
	'form.digits',
	'form.taxId',
	'form.url',
	'form.tooLong',
	'form.minPrice',
	'form.pastDate',
	'form.pickOne',
] as const

export type FormErrorKey = (typeof FORM_ERRORS)[number]

const isFormErrorKey = (value: unknown): value is FormErrorKey =>
	FORM_ERRORS.includes(value as FormErrorKey)

/** Zod messages that are i18n keys are translated; anything else becomes a generic message. */
export function formError(
	t: TFunction,
	error: { message?: string } | undefined,
): string | undefined {
	if (!error) return undefined
	return t(isFormErrorKey(error.message) ? error.message : 'form.invalid')
}

/** Kazakhstan mobile in any common spelling: +7 701 123-45-67, 8(701)1234567 */
export const PHONE_PATTERN = /^(\+7|8|7)?[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}$/

/** Digits only, so "450 000" and "450000" mean the same. */
export function parseAmount(value: string | undefined): number | null {
	const digits = (value ?? '').replace(/\D/g, '')
	return digits ? Number(digits) : null
}

export function todayIso(): string {
	const now = new Date()
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
