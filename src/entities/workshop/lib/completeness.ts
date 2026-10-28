import type { WorkshopSchema } from '@/shared/api/generated/model'

export const PROFILE_CHECKS = [
	'description',
	'services',
	'materials',
	'warranty',
	'foundedYear',
	'website',
] as const

export type ProfileCheck = (typeof PROFILE_CHECKS)[number]

/** A description shorter than this tells clients little. */
export const DESCRIPTION_MIN = 80

/** Profile parts the owner has not filled yet, in the order worth fixing. */
export function missingProfileParts(workshop: WorkshopSchema): ProfileCheck[] {
	const filled: Record<ProfileCheck, boolean> = {
		description: workshop.description.trim().length >= DESCRIPTION_MIN,
		services: workshop.services.length > 0,
		materials: workshop.materials.length > 0,
		warranty: workshop.warrantyMonths !== null,
		foundedYear: workshop.foundedYear !== null,
		website: Boolean(workshop.website),
	}
	return PROFILE_CHECKS.filter((check) => !filled[check])
}

/** Share of filled parts, 0..100. */
export function profileCompleteness(workshop: WorkshopSchema): number {
	const missing = missingProfileParts(workshop).length
	return Math.round(((PROFILE_CHECKS.length - missing) / PROFILE_CHECKS.length) * 100)
}
