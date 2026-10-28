import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
	options: Option<T>[]
	value: T[]
	onChange: (value: T[]) => void
	/** Id of the visible label, so the group is announced with it */
	labelledBy?: string
	invalid?: boolean
}

/** Multi-select as pill toggles: specialisations, services, materials. */
export function ChoiceChips<T extends string>({
	options,
	value,
	onChange,
	labelledBy,
	invalid,
}: Props<T>) {
	return (
		<fieldset
			aria-labelledby={labelledBy}
			aria-invalid={invalid || undefined}
			className="flex min-w-0 flex-wrap gap-2"
		>
			{options.map((option) => {
				const active = value.includes(option.value)
				return (
					<button
						key={option.value}
						type="button"
						aria-pressed={active}
						onClick={() =>
							onChange(
								active ? value.filter((item) => item !== option.value) : [...value, option.value],
							)
						}
						className={cn(
							'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-body-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
							active && 'border-primary bg-primary/10 text-primary hover:bg-primary/15',
							invalid && !active && 'border-destructive/60',
						)}
					>
						{active && <Check className="size-4" />}
						{option.label}
					</button>
				)
			})}
		</fieldset>
	)
}
