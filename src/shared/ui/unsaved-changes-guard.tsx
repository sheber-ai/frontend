import { useBlocker } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

/**
 * Asks before leaving the page while a form has unsaved edits; the browser asks on reload or tab close.
 * Search-param changes on the same page (tabs, filters) pass through.
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
	const { t } = useTranslation()
	const blocker = useBlocker({
		shouldBlockFn: ({ current, next }) => when && current.pathname !== next.pathname,
		enableBeforeUnload: () => when,
		withResolver: true,
	})

	return (
		<AlertDialog
			open={blocker.status === 'blocked'}
			onOpenChange={(open) => !open && blocker.reset?.()}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{t('common.leaveTitle')}</AlertDialogTitle>
					<AlertDialogDescription>{t('common.leaveText')}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => blocker.reset?.()}>
						{t('common.stay')}
					</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={() => blocker.proceed?.()}>
						{t('common.leave')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
