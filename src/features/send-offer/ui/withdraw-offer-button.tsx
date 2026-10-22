import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useWithdrawOffer } from '@/shared/api/generated/endpoints/offers/offers'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

export function WithdrawOfferButton({ offerId }: { offerId: string }) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useWithdrawOffer()

	return (
		<ConfirmDialog
			title={t('offer.withdrawTitle')}
			description={t('offer.withdrawText')}
			confirmLabel={t('offer.withdraw')}
			cancelLabel={t('common.cancel')}
			destructive
			onConfirm={async () => {
				try {
					await mutateAsync({ offerId })
					await invalidatePaths(queryClient, API_PATHS.orders, API_PATHS.offers)
				} catch (error) {
					showError(error)
				}
			}}
		>
			<Button
				variant="ghost"
				disabled={isPending}
				className="text-destructive hover:text-destructive"
			>
				{t('offer.withdraw')}
			</Button>
		</ConfirmDialog>
	)
}
