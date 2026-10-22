import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

type Props = {
	icon: React.ReactNode
	title: React.ReactNode
	text?: React.ReactNode
	action?: React.ReactNode
	className?: string
}

export function EmptyState({ icon, title, text, action, className }: Props) {
	return (
		<div
			className={cn(
				'flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center',
				className,
			)}
		>
			<span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground [&_svg]:size-6">
				{icon}
			</span>
			<div className="flex max-w-md flex-col gap-1">
				<p className="text-h4">{title}</p>
				{text && <p className="text-body-sm text-muted-foreground">{text}</p>}
			</div>
			{action}
		</div>
	)
}
