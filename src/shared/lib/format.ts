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

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
	['minute', 60],
	['hour', 24],
	['day', 7],
	['week', 4.35],
	['month', 12],
	['year', Number.POSITIVE_INFINITY],
]

/** "5 минут назад"; under a minute returns null so the caller can say "just now". */
export function formatRelativeTime(
	value: string | Date,
	language: string,
	now: Date = new Date(),
): string | null {
	const date = typeof value === 'string' ? new Date(value) : value
	let amount = (date.getTime() - now.getTime()) / 60_000
	if (Math.abs(amount) < 1) return null
	const format = new Intl.RelativeTimeFormat(locale(language), { numeric: 'auto' })
	for (const [unit, size] of RELATIVE_STEPS) {
		if (Math.abs(amount) < size) return format.format(Math.round(amount), unit)
		amount /= size
	}
	return null
}

/** Time for today's messages, date and time for older ones. */
export function formatMessageTime(
	value: string | Date,
	language: string,
	now: Date = new Date(),
): string {
	const date = typeof value === 'string' ? new Date(value) : value
	const sameDay = date.toDateString() === now.toDateString()
	return new Intl.DateTimeFormat(locale(language), {
		hour: '2-digit',
		minute: '2-digit',
		...(sameDay ? {} : { day: 'numeric', month: 'short' }),
	}).format(date)
}
