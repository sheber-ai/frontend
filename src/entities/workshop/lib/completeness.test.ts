import { describe, expect, it } from 'vitest'
import type { WorkshopSchema } from '@/shared/api/generated/model'
import { missingProfileParts, profileCompleteness } from './completeness'

const bare: WorkshopSchema = {
	id: 'w1',
	name: 'Цех',
	city: { id: 'c1', name: 'Алматы' },
	serviceCities: [],
	description: '',
	website: null,
	furnitureTypes: ['wardrobe'],
	services: [],
	materials: [],
	warrantyMonths: null,
	foundedYear: null,
	createdAt: '2026-10-01T00:00:00Z',
	phone: '+77011234567',
	taxId: '123456789012',
	status: 'approved',
	rejectionReason: null,
	reviewedAt: null,
}

describe('profile completeness', () => {
	it('lists every missing part of a bare profile', () => {
		expect(missingProfileParts(bare)).toEqual([
			'description',
			'services',
			'materials',
			'warranty',
			'foundedYear',
			'website',
		])
		expect(profileCompleteness(bare)).toBe(0)
	})

	it('counts a zero warranty as stated and a short description as missing', () => {
		const workshop = { ...bare, warrantyMonths: 0, description: 'Шкафы' }
		expect(missingProfileParts(workshop)).not.toContain('warranty')
		expect(missingProfileParts(workshop)).toContain('description')
	})

	it('reaches 100 when everything is filled', () => {
		const full: WorkshopSchema = {
			...bare,
			description:
				'Делаем корпусную мебель из ЛДСП Egger и МДФ, свой цех 400 м², монтаж своими бригадами.',
			services: ['measurement'],
			materials: ['chipboard'],
			warrantyMonths: 12,
			foundedYear: 2016,
			website: 'https://instagram.com/agash',
		}
		expect(missingProfileParts(full)).toEqual([])
		expect(profileCompleteness(full)).toBe(100)
	})
})
