import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	useGetNotificationSummary,
	useListNotifications,
	useReadAllNotifications,
	useReadNotification,
} from '@/shared/api/generated/endpoints/notifications/notifications'
import type { NotificationSchema } from '@/shared/api/generated/model'
import { Bell, CheckCheck } from '@/shared/design'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Skeleton } from '@/shared/ui/skeleton'
import { notificationTarget } from '../model/notification-link'

const POLL_MS = 30_000
const LIST_LIMIT = 20

function Item({ item, onOpen }: { item: NotificationSchema; onOpen: () => void }) {
	const { t, i18n } = useTranslation()
	const when = formatRelativeTime(item.createdAt, i18n.language) ?? t('time.justNow')
	return (
		<li>
			<button
				type="button"
				onClick={onOpen}
				className="flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
			>
				<span
					aria-hidden
					className={cn(
						'mt-1.5 size-2 shrink-0 rounded-full',
						item.readAt ? 'bg-transparent' : 'bg-primary',
					)}
				/>
				<span className="flex min-w-0 flex-col gap-0.5">
					<span className={cn('text-body-sm', !item.readAt && 'font-medium')}>
						{t(`notifications.kinds.${item.kind}`, {
							subject: item.subject,
							actor: item.actor ?? '',
						})}
					</span>
					<span className="text-caption text-muted-foreground">{when}</span>
				</span>
			</button>
		</li>
	)
}

export function NotificationsMenu() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [open, setOpen] = useState(false)
	const { data: summary } = useGetNotificationSummary({ query: { refetchInterval: POLL_MS } })
	const list = useListNotifications({ limit: LIST_LIMIT }, { query: { enabled: open } })
	const readOne = useReadNotification()
	const readAll = useReadAllNotifications()
	const unread = summary?.unread ?? 0

	const refresh = () => invalidatePaths(queryClient, API_PATHS.notifications)

	const openItem = (item: NotificationSchema) => {
		setOpen(false)
		if (!item.readAt) readOne.mutate({ notificationId: item.id }, { onSettled: refresh })
		const target = notificationTarget(item)
		if (target) void navigate(target)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					aria-label={
						unread > 0
							? `${t('notifications.title')}: ${t('chat.unread', { count: unread })}`
							: t('notifications.title')
					}
				>
					<Bell />
					{unread > 0 && (
						<span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-caption leading-none font-semibold text-destructive-foreground tabular-nums">
							{unread > 99 ? '99+' : unread}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
				<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
					<p className="text-h4">{t('notifications.title')}</p>
					{unread > 0 && (
						<Button
							variant="ghost"
							size="sm"
							disabled={readAll.isPending}
							onClick={() => readAll.mutate(undefined, { onSettled: refresh })}
						>
							<CheckCheck />
							{t('notifications.readAll')}
						</Button>
					)}
				</div>
				<div className="max-h-[min(28rem,70svh)] overflow-y-auto p-1.5">
					{list.isPending ? (
						<div className="flex flex-col gap-2 p-2">
							<Skeleton className="h-12" />
							<Skeleton className="h-12" />
						</div>
					) : list.data && list.data.items.length > 0 ? (
						<ul className="flex flex-col">
							{list.data.items.map((item) => (
								<Item key={item.id} item={item} onOpen={() => openItem(item)} />
							))}
						</ul>
					) : (
						<p className="px-4 py-8 text-center text-body-sm text-muted-foreground">
							{t('notifications.empty')}
						</p>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
