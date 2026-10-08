export type Point3 = [number, number, number]

const COS = Math.cos(Math.PI / 6)
const SIN = 0.5

/** Isometric projection: +x goes right-down, +z left-down, +y up. */
export function project([x, y, z]: Point3): [number, number] {
	return [(x - z) * COS, (x + z) * SIN - y]
}

export function path(points: Point3[], close = false): string {
	const d = points
		.map((point, index) => {
			const [x, y] = project(point)
			return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
		})
		.join(' ')
	return close ? `${d} Z` : d
}
