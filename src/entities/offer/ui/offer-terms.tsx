import { useTranslation } from 'react-i18next'
import type { OfferSchema } from '@/shared/api/generated/model'
import { Check, Minus } from '@/shared/design'
import { cn } from '@/shared/lib/utils'

type Terms = Pick<
	OfferSchema,
	'warrantyMonths' | 'includesDelivery' | 'includesInstallation' | 'prepaymentPercent'
>

/** What the price includes, side by side for every offer so clients compare the same things. */
export function OfferTerms({ offer, className }: { offer: Terms; className?: string }) {
	const { t } = useTranslation()
	const items = [
		{ on: offer.includesDelivery, label: t('offerTerms.delivery') },
		{ on: offer.includesInstallation, label: t('offerTerms.installation') },
		{
			on: Boolean(offer.warrantyMonths),
			label: offer.warrantyMonths
				? t('offerTerms.warranty', { count: offer.warrantyMonths })
				: t('offerTerms.noWarranty'),
		},
		{
			on: offer.prepaymentPercent !== null,
			label:
				offer.prepaymentPercent === null
					? t('offerTerms.prepaymentUnknown')
					: offer.prepaymentPercent === 0
						? t('offerTerms.noPrepayment')
						: t('offerTerms.prepayment', { percent: offer.prepaymentPercent }),
			neutral: true,
		},
	]
	return (
		<ul className={cn('grid grid-cols-1 gap-x-4 gap-y-1.5 text-body-sm sm:grid-cols-2', className)}>
			{items.map((item) => (
				<li
					key={item.label}
					className={cn(
						'flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0',
						!item.on && 'text-muted-foreground',
					)}
				>
					{item.on ? (
						<Check className={item.neutral ? 'text-muted-foreground' : 'text-success'} />
					) : (
						<Minus />
					)}
					{item.label}
				</li>
			))}
		</ul>
	)
}
