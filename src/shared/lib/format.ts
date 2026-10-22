const LOCALES: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' }

const locale = (language: string) => LOCALES[language] ?? 'ru-RU'

export function formatNumber(value: number, language: string): string {
	return new Intl.NumberFormat(locale(language)).format(Math.round(value))
}

/** Tenge without decimals: 450 000 ₸ */
export function formatMoney(value: number, language: string): string {
	return `${formatNumber(value, language)} ₸`
}

export function formatDate(value: string | Date, language: string): string {
	return new Intl.DateTimeFormat(locale(language), {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(typeof value === 'string' ? new Date(value) : value)
}

/** +77011234567 -> +7 701 123 45 67 */
export function formatPhone(value: string): string {
	const match = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(value)
	return match ? `+7 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : value
}
