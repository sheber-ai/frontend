import type * as React from 'react'
import { createContext, useContext } from 'react'
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

const FieldMessageContext = createContext<string | undefined>(undefined)

/** Id of the hint or error under the enclosing Field, for the control's `aria-describedby`. */
export function useFieldMessageId(): string | undefined {
	return useContext(FieldMessageContext)
}

export function Field({ label, htmlFor, hint, error, aside, className, children }: Props) {
	const messageId = htmlFor && (error || hint) ? `${htmlFor}-message` : undefined
	return (
		<div className={cn('flex min-w-0 flex-col gap-2', className)}>
			<div className="flex items-baseline justify-between gap-2">
				<Label htmlFor={htmlFor}>{label}</Label>
				{aside && <span className="text-body-sm text-muted-foreground tabular-nums">{aside}</span>}
			</div>
			<FieldMessageContext.Provider value={messageId}>{children}</FieldMessageContext.Provider>
			{error ? (
				<p id={messageId} role="alert" className="text-body-sm text-destructive">
					{error}
				</p>
			) : (
				hint && (
					<p id={messageId} className="text-body-sm text-muted-foreground">
						{hint}
					</p>
				)
			)}
		</div>
	)
}
