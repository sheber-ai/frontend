import type { TFunction } from 'i18next'
import { z } from 'zod'
import { isValidPhone } from './phone'

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
	'form.year',
	'form.number',
	'form.percent',
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

/** Value of PhoneInput: required, complete and existing (E.164). */
export const phoneField = () => z.string().refine(isValidPhone, 'form.phone')

/** Digits only, so "450 000" and "450000" mean the same. */
export function parseAmount(value: string | undefined): number | null {
	const digits = (value ?? '').replace(/\D/g, '')
	return digits ? Number(digits) : null
}

export function todayIso(): string {
	const now = new Date()
	return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}
