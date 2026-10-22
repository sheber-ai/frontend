import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	useApproveWorkshop,
	useRejectWorkshop,
} from '@/shared/api/generated/endpoints/workshops/workshops'
import type { WorkshopStatusEnum } from '@/shared/api/generated/model'
import { BadgeCheck, Ban } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

type Props = { workshopId: string; name: string; status: WorkshopStatusEnum }

export function ModerationActions({ workshopId, name, status }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const approve = useApproveWorkshop()
	const reject = useRejectWorkshop()
	const [open, setOpen] = useState(false)
	const [reason, setReason] = useState('')

	const refresh = () => invalidatePaths(queryClient, API_PATHS.workshops)

	const onApprove = async () => {
		try {
			await approve.mutateAsync({ workshopId })
			await refresh()
			toast.success(t('moderation.approved', { name }))
		} catch (error) {
			showError(error)
		}
	}

	const onReject = async (event: React.FormEvent) => {
		event.preventDefault()
		if (reason.trim().length < 3) return
		try {
			await reject.mutateAsync({ workshopId, data: { reason: reason.trim() } })
			await refresh()
			setOpen(false)
			setReason('')
			toast.success(t('moderation.rejected', { name }))
		} catch (error) {
			showError(error)
		}
	}

	return (
		<div className="flex flex-col gap-2 sm:flex-row">
			{status !== 'approved' && (
				<Button size="sm" disabled={approve.isPending} onClick={() => void onApprove()}>
					<BadgeCheck />
					{t('moderation.approve')}
				</Button>
			)}
			{status !== 'rejected' && (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm" variant="outline">
							<Ban />
							{status === 'approved' ? t('moderation.revoke') : t('moderation.reject')}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<form onSubmit={onReject} className="flex flex-col gap-5">
							<DialogHeader>
								<DialogTitle>{t('moderation.rejectTitle', { name })}</DialogTitle>
								<DialogDescription>{t('moderation.rejectText')}</DialogDescription>
							</DialogHeader>
							<Field label={t('moderation.reason')} htmlFor={`reason-${workshopId}`}>
								<Textarea
									id={`reason-${workshopId}`}
									rows={4}
									value={reason}
									onChange={(event) => setReason(event.target.value)}
								/>
							</Field>
							<DialogFooter>
								<Button
									type="submit"
									variant="destructive"
									disabled={reject.isPending || reason.trim().length < 3}
								>
									{status === 'approved' ? t('moderation.revoke') : t('moderation.reject')}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}
