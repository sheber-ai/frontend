import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	getGetOrderThreadQueryKey,
	getListOrderThreadsQueryKey,
	useGetOrderThread,
	useSendOrderMessage,
} from '@/shared/api/generated/endpoints/messages/messages'
import type { MessageSchema } from '@/shared/api/generated/model'
import { sendOrderMessageBodyBodyMax } from '@/shared/api/generated/zod/messages/messages.zod'
import { Check, CheckCheck, Info, MessageCircle, Send, TriangleAlert } from '@/shared/design'
import { formatMessageTime } from '@/shared/lib/format'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'

const POLL_MS = 10_000

const schema = z.object({ body: z.string().trim().min(1).max(sendOrderMessageBodyBodyMax) })
type Values = z.infer<typeof schema>

type Props = {
	orderId: string
	/** Required for the order owner: the workshop to talk to */
	workshopId?: string
}

function Bubble({ message, theirName }: { message: MessageSchema; theirName: string }) {
	const { t, i18n } = useTranslation()
	const mine = message.isMine
	return (
		<li
			className={cn('flex max-w-[85%] flex-col gap-1', mine ? 'self-end items-end' : 'self-start')}
		>
			{!mine && <span className="px-1 text-caption text-muted-foreground">{theirName}</span>}
			<p
				className={cn(
					'rounded-2xl px-3.5 py-2 text-body-sm break-words whitespace-pre-line',
					mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted',
				)}
			>
				{message.body}
			</p>
			<span className="inline-flex items-center gap-1 px-1 text-caption text-muted-foreground [&_svg]:size-3.5">
				{formatMessageTime(message.createdAt, i18n.language)}
				{mine &&
					(message.readAt ? (
						<CheckCheck aria-label={t('chat.read')} />
					) : (
						<Check aria-label={t('chat.delivered')} />
					))}
			</span>
		</li>
	)
}

export function ChatThread({ orderId, workshopId }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const params = workshopId ? { workshopId } : undefined
	const { data, isPending, isError } = useGetOrderThread(orderId, params, {
		query: { refetchInterval: POLL_MS },
	})
	const send = useSendOrderMessage()
	const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { body: '' } })
	const endRef = useRef<HTMLDivElement>(null)
	const lastId = data?.messages.at(-1)?.id

	// Opening the thread marks it read on the server: refresh badges, scroll to the newest line
	useEffect(() => {
		if (!lastId) return
		endRef.current?.scrollIntoView({ block: 'end' })
		void queryClient.invalidateQueries({ queryKey: getListOrderThreadsQueryKey(orderId) })
		void invalidatePaths(queryClient, API_PATHS.notifications)
	}, [lastId, orderId, queryClient])

	const submit = form.handleSubmit(async ({ body }) => {
		try {
			await send.mutateAsync({ orderId, data: { body, workshopId } })
			form.reset()
			await queryClient.invalidateQueries({ queryKey: getGetOrderThreadQueryKey(orderId, params) })
		} catch (error) {
			showError(error)
		}
	})

	if (isPending) {
		return (
			<div className="flex flex-1 flex-col gap-3 p-4">
				<Skeleton className="h-12 w-2/3" />
				<Skeleton className="h-12 w-1/2 self-end" />
				<Skeleton className="h-12 w-3/5" />
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
				<TriangleAlert className="size-6" />
				<p className="text-body-sm">{t('chat.loadError')}</p>
			</div>
		)
	}

	const theirName = workshopId ? data.workshop.name : t('chat.client')

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4" aria-live="polite">
				{data.messages.length === 0 ? (
					<div className="m-auto flex max-w-xs flex-col items-center gap-3 text-center text-muted-foreground">
						<MessageCircle className="size-6" />
						<p className="text-body-sm">{t('chat.empty')}</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3">
						{data.messages.map((message) => (
							<Bubble key={message.id} message={message} theirName={theirName} />
						))}
					</ul>
				)}
				<div ref={endRef} />
			</div>

			{data.canWrite ? (
				<form onSubmit={submit} className="flex flex-col gap-2 border-t p-3" noValidate>
					<div className="flex items-end gap-2">
						<Textarea
							rows={2}
							maxLength={sendOrderMessageBodyBodyMax}
							placeholder={t('chat.placeholder')}
							aria-label={t('chat.placeholder')}
							className="max-h-40 min-h-11 resize-none"
							onKeyDown={(event) => {
								if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
									event.preventDefault()
									void submit()
								}
							}}
							{...form.register('body')}
						/>
						<Button
							type="submit"
							size="icon"
							disabled={send.isPending}
							aria-label={t('chat.send')}
							className="size-11 shrink-0"
						>
							<Send />
						</Button>
					</div>
					<p className="px-1 text-caption text-muted-foreground max-sm:hidden">{t('chat.hint')}</p>
				</form>
			) : (
				<p className="flex items-start gap-2 border-t bg-muted/50 p-4 text-body-sm text-muted-foreground">
					<Info className="mt-0.5 size-4 shrink-0" />
					{t('chat.closed')}
				</p>
			)}
		</>
	)
}
