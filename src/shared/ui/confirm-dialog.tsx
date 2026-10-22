import type * as React from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'

type Props = {
	title: React.ReactNode
	description?: React.ReactNode
	confirmLabel: React.ReactNode
	cancelLabel: React.ReactNode
	destructive?: boolean
	onConfirm: () => void
	children: React.ReactNode
}

/** Asks before an action that is hard to undo. */
export function ConfirmDialog({
	title,
	description,
	confirmLabel,
	cancelLabel,
	destructive,
	onConfirm,
	children,
}: Props) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && <AlertDialogDescription>{description}</AlertDialogDescription>}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
