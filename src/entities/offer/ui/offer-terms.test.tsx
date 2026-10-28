import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OfferTerms } from './offer-terms'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: Record<string, number>) =>
			options ? `${key}:${Object.values(options).join(',')}` : key,
	}),
}))

describe('OfferTerms', () => {
	it('states every term, including what is missing', () => {
		render(
			<OfferTerms
				offer={{
					warrantyMonths: 24,
					includesDelivery: true,
					includesInstallation: false,
					prepaymentPercent: 0,
				}}
			/>,
		)
		expect(screen.getByText('offerTerms.delivery')).toBeInTheDocument()
		expect(screen.getByText('offerTerms.installation')).toBeInTheDocument()
		expect(screen.getByText('offerTerms.warranty:24')).toBeInTheDocument()
		expect(screen.getByText('offerTerms.noPrepayment')).toBeInTheDocument()
	})

	it('says when warranty and prepayment are not stated', () => {
		render(
			<OfferTerms
				offer={{
					warrantyMonths: null,
					includesDelivery: false,
					includesInstallation: false,
					prepaymentPercent: null,
				}}
			/>,
		)
		expect(screen.getByText('offerTerms.noWarranty')).toBeInTheDocument()
		expect(screen.getByText('offerTerms.prepaymentUnknown')).toBeInTheDocument()
	})
})
