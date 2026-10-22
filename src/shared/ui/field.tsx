import type * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

type Props = {
	label: React.ReactNode
	htmlFor?: string
	hint?: React.ReactNode
	error?: React.ReactNode
	/** Shown right of the label, e.g. the current value */
	aside?: React.ReactNode
	className?: string
	children: React.ReactNode
}

export function Field({ label, htmlFor, hint, error, aside, className, children }: Props) {
	return (
		<div className={cn('flex min-w-0 flex-col gap-2', className)}>
			<div className="flex items-baseline justify-between gap-2">
				<Label htmlFor={htmlFor}>{label}</Label>
				{aside && <span className="text-body-sm text-muted-foreground tabular-nums">{aside}</span>}
			</div>
			{children}
			{error ? (
				<p className="text-body-sm text-destructive">{error}</p>
			) : (
				hint && <p className="text-body-sm text-muted-foreground">{hint}</p>
			)}
		</div>
	)
}
