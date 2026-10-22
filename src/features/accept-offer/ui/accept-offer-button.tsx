import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useAcceptOffer } from '@/shared/api/generated/endpoints/offers/offers'
import { Check } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { toast } from '@/shared/ui/sonner'

export function AcceptOfferButton({
	offerId,
	workshopName,
}: {
	offerId: string
	workshopName: string
}) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useAcceptOffer()

	return (
		<ConfirmDialog
			title={t('offer.acceptTitle', { name: workshopName })}
			description={t('offer.acceptText')}
			confirmLabel={t('offer.accept')}
			cancelLabel={t('common.cancel')}
			onConfirm={async () => {
				try {
					await mutateAsync({ offerId })
					await invalidatePaths(queryClient, API_PATHS.orders, API_PATHS.offers)
					toast.success(t('offer.accepted'))
				} catch (error) {
					showError(error)
				}
			}}
		>
			<Button size="sm" disabled={isPending} className="w-full sm:w-auto">
				<Check />
				{t('offer.accept')}
			</Button>
		</ConfirmDialog>
	)
}
