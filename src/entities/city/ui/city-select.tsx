import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, MapPin } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useCities } from '../model/use-cities'

export type CityPreset = { key: string; label: string; active: boolean; onSelect: () => void }

type Props = {
	id?: string
	/** City id */
	value: string | null | undefined
	onChange: (cityId: string) => void
	/** Adds an "all cities" option that calls onClear */
	allowAll?: boolean
	onClear?: () => void
	/** Choices shown above the cities, e.g. "my cities"; the active one names the trigger */
	presets?: CityPreset[]
	/** Cities that cannot be picked, e.g. already chosen */
	exclude?: string[]
	placeholder?: string
	invalid?: boolean
	className?: string
}

export function CitySelect({
	id,
	value,
	onChange,
	allowAll,
	onClear,
	presets = [],
	exclude = [],
	placeholder,
	invalid,
	className,
}: Props) {
	const { t } = useTranslation()
	const { cities } = useCities()
	const [open, setOpen] = useState(false)
	const selected = cities.find((city) => city.id === value)
	const preset = presets.find((item) => item.active)
	const label =
		selected?.name ??
		preset?.label ??
		(allowAll ? t('city.all') : (placeholder ?? t('city.placeholder')))

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-invalid={invalid}
					className={cn('h-10 w-full justify-between px-3 font-normal', className)}
				>
					<span className="flex min-w-0 items-center gap-2">
						<MapPin className="text-muted-foreground" />
						<span className={cn('truncate', !selected && !preset && 'text-muted-foreground')}>
							{label}
						</span>
					</span>
					<ChevronDown className="text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
				<Command>
					<CommandInput placeholder={t('city.search')} />
					<CommandList>
						<CommandEmpty>{t('city.notFound')}</CommandEmpty>
						<CommandGroup>
							{presets.map((item) => (
								<CommandItem
									key={item.key}
									value={item.label}
									onSelect={() => {
										item.onSelect()
										setOpen(false)
									}}
								>
									<Check className={cn('size-4', item.active ? 'opacity-100' : 'opacity-0')} />
									{item.label}
								</CommandItem>
							))}
							{allowAll && (
								<CommandItem
									value={t('city.all')}
									onSelect={() => {
										onClear?.()
										setOpen(false)
									}}
								>
									<Check className={cn('size-4', value ? 'opacity-0' : 'opacity-100')} />
									{t('city.all')}
								</CommandItem>
							)}
							{cities
								.filter((city) => !exclude.includes(city.id))
								.map((city) => (
									<CommandItem
										key={city.id}
										value={`${city.name} ${city.slug}`}
										onSelect={() => {
											onChange(city.id)
											setOpen(false)
										}}
									>
										<Check
											className={cn('size-4', value === city.id ? 'opacity-100' : 'opacity-0')}
										/>
										{city.name}
									</CommandItem>
								))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
