import { cn } from '@/shared/lib/utils'

/** Up to two initials of the workshop name: "Ағаш Шебер" -> "АШ". Logos need file uploads, which come later. */
export function workshopInitials(name: string): string {
	const words = name
		.replace(/[«»"']/g, '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
	return words
		.slice(0, 2)
		.map((word) => word[0]?.toLocaleUpperCase() ?? '')
		.join('')
}

/** The uploaded logo when there is one, initials otherwise. */
export function WorkshopAvatar({
	name,
	src,
	className,
}: {
	name: string
	src?: string | null
	className?: string
}) {
	if (src) {
		return (
			<img
				src={src}
				alt=""
				className={cn('size-10 shrink-0 rounded-lg border bg-card object-cover', className)}
			/>
		)
	}
	return (
		<span
			aria-hidden
			className={cn(
				'flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary font-semibold text-secondary-foreground select-none',
				className,
			)}
		>
			{workshopInitials(name)}
		</span>
	)
}
