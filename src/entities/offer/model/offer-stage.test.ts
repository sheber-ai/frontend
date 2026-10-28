import { describe, expect, it } from 'vitest'
import { offerStage, offerTab } from './offer-stage'

const stage = (status: string, orderStatus: string) =>
	offerStage({ status, order: { status: orderStatus } } as Parameters<typeof offerStage>[0])

describe('offerStage', () => {
	it('keeps waiting and chosen offers active', () => {
		expect(stage('pending', 'published')).toBe('pending')
		expect(stage('accepted', 'assigned')).toBe('chosen')
		expect(stage('accepted', 'in_progress')).toBe('inProgress')
		expect(offerTab('chosen')).toBe('active')
	})

	it('archives finished and lost offers', () => {
		expect(stage('accepted', 'completed')).toBe('done')
		expect(stage('accepted', 'cancelled')).toBe('closed')
		expect(stage('rejected', 'assigned')).toBe('closed')
		expect(stage('withdrawn', 'published')).toBe('closed')
		expect(offerTab('done')).toBe('archive')
	})
})
