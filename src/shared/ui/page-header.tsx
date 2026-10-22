import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

type Props = {
	title: React.ReactNode
	description?: React.ReactNode
	eyebrow?: React.ReactNode
	actions?: React.ReactNode
	className?: string
}

export function PageHeader({ title, description, eyebrow, actions, className }: Props) {
	return (
		<div
			className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
		>
			<div className="flex min-w-0 flex-col gap-2">
				{eyebrow && <p className="text-caption tracking-wider text-primary uppercase">{eyebrow}</p>}
				<h1 className="text-h2 text-balance sm:text-h1">{title}</h1>
				{description && <p className="max-w-2xl text-body text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>}
		</div>
	)
}
