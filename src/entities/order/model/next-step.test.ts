import { describe, expect, it } from 'vitest'
import { clientNextStep, orderGroup, workshopNextStep } from './next-step'

describe('clientNextStep', () => {
	it('asks to choose once offers arrive', () => {
		expect(clientNextStep({ status: 'published', offersCount: 0 })).toBe('waitOffers')
		expect(clientNextStep({ status: 'published', offersCount: 2 })).toBe('chooseWorkshop')
	})

	it('follows the order after a workshop is chosen', () => {
		expect(clientNextStep({ status: 'assigned', offersCount: 1 })).toBe('agreeStart')
		expect(clientNextStep({ status: 'in_progress', offersCount: 1 })).toBe('confirmDone')
	})

	it('has nothing to do with closed orders', () => {
		expect(clientNextStep({ status: 'completed', offersCount: 1 })).toBeNull()
		expect(clientNextStep({ status: 'cancelled', offersCount: 0 })).toBeNull()
	})
})

describe('orderGroup', () => {
	it('keeps everything unfinished in the active tab', () => {
		expect(orderGroup('published')).toBe('active')
		expect(orderGroup('assigned')).toBe('active')
		expect(orderGroup('in_progress')).toBe('active')
		expect(orderGroup('completed')).toBe('completed')
		expect(orderGroup('cancelled')).toBe('cancelled')
	})
})

describe('workshopNextStep', () => {
	it('guides the chosen workshop through the work', () => {
		expect(workshopNextStep('assigned', true, true)).toBe('agreeAndStart')
		expect(workshopNextStep('in_progress', true, true)).toBe('finishWork')
		expect(workshopNextStep('completed', true, true)).toBeNull()
	})

	it('tells other workshops whether to wait', () => {
		expect(workshopNextStep('published', false, true)).toBe('waitChoice')
		expect(workshopNextStep('assigned', false, true)).toBe('notChosen')
		expect(workshopNextStep('published', false, false)).toBeNull()
	})
})
