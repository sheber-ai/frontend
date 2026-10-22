import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	useCancelOrder,
	useCompleteOrder,
	useStartOrder,
} from '@/shared/api/generated/endpoints/orders/orders'
import type { OrderDetailSchema } from '@/shared/api/generated/model'
import { CheckCheck, Hammer } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { toast } from '@/shared/ui/sonner'

type Props = { order: OrderDetailSchema; isAssignedWorkshop: boolean }

/** Status moves allowed to the viewer: the client cancels or completes, the chosen workshop starts work. */
export function OrderActions({ order, isAssignedWorkshop }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const cancel = useCancelOrder()
	const start = useStartOrder()
	const complete = useCompleteOrder()

	const run = async (action: () => Promise<unknown>, message: string) => {
		try {
			await action()
			await invalidatePaths(queryClient, API_PATHS.orders, API_PATHS.offers)
			toast.success(message)
		} catch (error) {
			showError(error)
		}
	}

	const canCancel = order.isOwner && (order.status === 'published' || order.status === 'assigned')
	const canComplete =
		order.isOwner && (order.status === 'assigned' || order.status === 'in_progress')
	const canStart = isAssignedWorkshop && order.status === 'assigned'
	if (!canCancel && !canComplete && !canStart) return null

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			{canStart && (
				<Button
					disabled={start.isPending}
					onClick={() =>
						void run(() => start.mutateAsync({ orderId: order.id }), t('orderActions.started'))
					}
				>
					<Hammer />
					{t('orderActions.start')}
				</Button>
			)}
			{canComplete && (
				<ConfirmDialog
					title={t('orderActions.completeTitle')}
					description={t('orderActions.completeText')}
					confirmLabel={t('orderActions.complete')}
					cancelLabel={t('common.cancel')}
					onConfirm={() =>
						void run(() => complete.mutateAsync({ orderId: order.id }), t('orderActions.completed'))
					}
				>
					<Button disabled={complete.isPending}>
						<CheckCheck />
						{t('orderActions.complete')}
					</Button>
				</ConfirmDialog>
			)}
			{canCancel && (
				<ConfirmDialog
					title={t('orderActions.cancelTitle')}
					description={t('orderActions.cancelText')}
					confirmLabel={t('orderActions.cancel')}
					cancelLabel={t('common.back')}
					destructive
					onConfirm={() =>
						void run(() => cancel.mutateAsync({ orderId: order.id }), t('orderActions.cancelled'))
					}
				>
					<Button
						variant="outline"
						disabled={cancel.isPending}
						className="text-destructive hover:text-destructive"
					>
						{t('orderActions.cancel')}
					</Button>
				</ConfirmDialog>
			)}
		</div>
	)
}
