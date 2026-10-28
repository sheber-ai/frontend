import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/shared/ui/sheet'
import { ChatThread } from './chat-thread'

type Props = {
	orderId: string
	/** Required for the order owner: the workshop to talk to */
	workshopId?: string
	title: string
	description?: string
	unread?: number
	label?: string
	variant?: 'default' | 'outline' | 'secondary'
	className?: string
}

/** Opens the order conversation in a side sheet; shows the unread count on the button. */
export function OrderChatButton({
	orderId,
	workshopId,
	title,
	description,
	unread = 0,
	label,
	variant = 'outline',
	className,
}: Props) {
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant={variant} size="sm" className={cn('w-full sm:w-auto', className)}>
					<MessageCircle />
					{label ?? t('chat.open')}
					{unread > 0 && (
						<span className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-caption font-medium text-destructive-foreground tabular-nums">
							<span className="sr-only">{t('chat.unread', { count: unread })}</span>
							<span aria-hidden>{unread}</span>
						</span>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
				<SheetHeader className="border-b p-4 pr-12">
					<SheetTitle className="truncate text-h4">{title}</SheetTitle>
					<SheetDescription className={cn(!description && 'sr-only')}>
						{description ?? t('chat.title')}
					</SheetDescription>
				</SheetHeader>
				{open && <ChatThread orderId={orderId} workshopId={workshopId} />}
			</SheetContent>
		</Sheet>
	)
}
