import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

type Option<T extends string> = {
	value: T
	label: React.ReactNode
	icon?: React.ReactNode
	disabled?: boolean
}

type Props<T extends string> = {
	value: T
	onChange: (value: T) => void
	options: Option<T>[]
	label: string
	/** `grid` lays options out as equal tiles with the icon above the label */
	layout?: 'row' | 'grid'
	className?: string
}

/** Single choice from a few options; the active one is raised. */
export function Segmented<T extends string>({
	value,
	onChange,
	options,
	label,
	layout = 'row',
	className,
}: Props<T>) {
	return (
		<fieldset
			aria-label={label}
			className={cn(
				'grid gap-1 rounded-lg bg-muted p-1',
				layout === 'row' ? 'grid-flow-col auto-cols-fr' : 'grid-cols-2 sm:grid-cols-4',
				className,
			)}
		>
			{options.map((option) => {
				const active = option.value === value
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={active}
						disabled={option.disabled}
						onClick={() => onChange(option.value)}
						className={cn(
							'flex min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-body-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
							layout === 'row' ? 'h-9' : 'h-16 flex-col gap-1 [&_svg]:size-5',
							active && 'bg-card text-foreground shadow-xs',
						)}
					>
						{option.icon}
						<span className="truncate">{option.label}</span>
					</button>
				)
			})}
		</fieldset>
	)
}
