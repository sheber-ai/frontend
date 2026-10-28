import { LIMITS, type Size } from '@/entities/furniture'
import type { FurnitureTypeEnum, ImportSizeSchema } from '@/shared/api/generated/model'

const KEYWORDS: [FurnitureTypeEnum, RegExp][] = [
	['dresser', /комод|тумб|dresser|chest of drawers|sideboard|жәшік/i],
	['shelving', /стеллаж|этажерк|книжн|полк|shelv|bookcase|сөре/i],
	['wardrobe', /шкаф|гардероб|купе|wardrobe|closet|armoire|шкафы|киім/i],
]

/** Best guess of the furniture type from the product title; the client can change it. */
export function guessFurnitureType(title: string | null | undefined): FurnitureTypeEnum | null {
	if (!title) return null
	for (const [type, pattern] of KEYWORDS) if (pattern.test(title)) return type
	return null
}

/** Shop sizes fitted into what the constructor can build; `clamped` tells the user something changed. */
export function fitImportedSize(
	imported: ImportSizeSchema | null | undefined,
	fallback: Size,
): { size: Size; clamped: boolean } {
	const pick = (
		value: number | null | undefined,
		base: number,
		limits: { min: number; max: number },
	) => {
		if (value === null || value === undefined) return { value: base, clamped: false }
		const fitted = Math.min(Math.max(Math.round(value), limits.min), limits.max)
		return { value: fitted, clamped: fitted !== Math.round(value) }
	}
	const width = pick(imported?.width, fallback.width, LIMITS.width)
	const height = pick(imported?.height, fallback.height, LIMITS.height)
	const depth = pick(imported?.depth, fallback.depth, LIMITS.depth)
	return {
		size: { width: width.value, height: height.value, depth: depth.value },
		clamped: width.clamped || height.clamped || depth.clamped,
	}
}
