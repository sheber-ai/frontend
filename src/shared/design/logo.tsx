import { cn } from '@/shared/lib/utils'

// Emblem: a bent-wood "S" (Sheber) inside a rounded tile.
const EMBLEM_PATH = 'M22 10H12.5a3 3 0 0 0 0 6h7a3 3 0 0 1 0 6H10'

type LogoMarkProps = {
	className?: string
	/** `brand` uses theme colors, `mono` inherits currentColor. */
	variant?: 'brand' | 'mono'
}

export function LogoMark({ className, variant = 'brand' }: LogoMarkProps) {
	const isBrand = variant === 'brand'
	return (
		<svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden="true">
			<rect width="32" height="32" rx="8" className={isBrand ? 'fill-primary' : 'fill-current'} />
			<path
				d={EMBLEM_PATH}
				fill="none"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={isBrand ? 'stroke-primary-foreground' : 'stroke-background'}
			/>
		</svg>
	)
}

type LogoProps = LogoMarkProps & {
	showWordmark?: boolean
	wordmarkClassName?: string
}

export function Logo({ className, variant, showWordmark = true, wordmarkClassName }: LogoProps) {
	return (
		<span className={cn('inline-flex items-center gap-2.5', className)}>
			<LogoMark variant={variant} />
			{showWordmark && (
				<span className={cn('text-h4 tracking-tight', wordmarkClassName)}>Sheber</span>
			)}
		</span>
	)
}
