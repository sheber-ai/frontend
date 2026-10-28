import { useTranslation } from 'react-i18next'
import { X } from '@/shared/design'
import { useCities } from '../model/use-cities'
import { CitySelect } from './city-select'

type Props = {
	id?: string
	/** City ids in the order they were added */
	value: string[]
	onChange: (cityIds: string[]) => void
	/** Cities that are implied and cannot be added, e.g. the main city */
	exclude?: string[]
	max?: number
}

/** Picked cities as removable chips plus a searchable list to add one more. */
export function CityMultiSelect({ id, value, onChange, exclude = [], max = 20 }: Props) {
	const { t } = useTranslation()
	const { cities } = useCities()
	const picked = value
		.filter((cityId) => !exclude.includes(cityId))
		.map((cityId) => ({ id: cityId, name: cities.find((city) => city.id === cityId)?.name ?? '…' }))

	return (
		<div className="flex flex-col gap-2">
			{picked.length > 0 && (
				<ul className="flex flex-wrap gap-2">
					{picked.map((city) => (
						<li
							key={city.id}
							className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-body-sm text-secondary-foreground"
						>
							{city.name}
							<button
								type="button"
								onClick={() => onChange(value.filter((item) => item !== city.id))}
								aria-label={t('city.remove', { name: city.name })}
								className="flex size-7 items-center justify-center rounded-full outline-none hover:bg-background/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								<X className="size-3.5" />
							</button>
						</li>
					))}
				</ul>
			)}
			{picked.length < max && (
				<CitySelect
					id={id}
					value={null}
					placeholder={t('city.add')}
					exclude={[...exclude, ...value]}
					onChange={(cityId) => onChange([...value, cityId])}
				/>
			)}
		</div>
	)
}
