import { useTranslation } from 'react-i18next'
import { Check, MATERIALS, type MaterialName } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Field } from '@/shared/ui/field'

const NAMES = Object.keys(MATERIALS) as MaterialName[]

type Props = { label: string; value: MaterialName; onChange: (value: MaterialName) => void }

export function MaterialPicker({ label, value, onChange }: Props) {
	const { t } = useTranslation()
	return (
		<Field label={label} aside={t(`materials.${value}`)}>
			<fieldset aria-label={label} className="flex flex-wrap gap-2">
				{NAMES.map((name) => {
					const active = name === value
					return (
						<button
							key={name}
							type="button"
							aria-pressed={active}
							aria-label={t(`materials.${name}`)}
							title={t(`materials.${name}`)}
							onClick={() => onChange(name)}
							className={cn(
								'flex size-10 items-center justify-center rounded-full border ring-2 ring-transparent ring-offset-2 ring-offset-card transition-transform outline-none hover:scale-105 focus-visible:ring-ring',
								active && 'ring-primary',
							)}
							style={{ background: MATERIALS[name].color }}
						>
							{active && <Check className="size-4 text-primary-foreground drop-shadow" />}
						</button>
					)
				})}
			</fieldset>
		</Field>
	)
}
