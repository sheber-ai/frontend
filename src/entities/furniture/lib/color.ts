const toRgb = (hex: string) => {
	const value = Number.parseInt(hex.slice(1), 16)
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const
}

const toHex = (rgb: readonly number[]) =>
	`#${rgb
		.map((channel) =>
			Math.round(Math.min(255, Math.max(0, channel)))
				.toString(16)
				.padStart(2, '0'),
		)
		.join('')}`

/** Linear sRGB mix: `t = 0` gives `from`, `t = 1` gives `to`. */
export function mix(from: string, to: string, t: number): string {
	const a = toRgb(from)
	const b = toRgb(to)
	return toHex(a.map((channel, index) => channel + ((b[index] ?? 0) - channel) * t))
}

/** Relative brightness in [0, 1]. */
export function luminance(hex: string): number {
	const [r, g, b] = toRgb(hex)
	return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}
