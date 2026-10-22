import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useDeleteDesign } from '@/shared/api/generated/endpoints/designs/designs'
import { Trash2 } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

export function DeleteDesignButton({ designId, title }: { designId: string; title: string }) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useDeleteDesign()

	return (
		<ConfirmDialog
			title={t('projects.deleteTitle', { title })}
			description={t('projects.deleteText')}
			confirmLabel={t('common.delete')}
			cancelLabel={t('common.cancel')}
			destructive
			onConfirm={async () => {
				try {
					await mutateAsync({ designId })
					await invalidatePaths(queryClient, API_PATHS.designs)
				} catch (error) {
					showError(error)
				}
			}}
		>
			<Button variant="ghost" size="icon-sm" disabled={isPending} aria-label={t('common.delete')}>
				<Trash2 />
			</Button>
		</ConfirmDialog>
	)
}
