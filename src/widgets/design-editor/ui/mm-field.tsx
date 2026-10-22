import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from '@/shared/ui/field'
import { Slider } from '@/shared/ui/slider'

type Props = {
	label: string
	value: number
	min: number
	max: number
	step?: number
	onChange: (value: number) => void
	/** Hide the slider for nested sizes where the range is not meaningful */
	slider?: boolean
}

/** Millimetre input: typing commits on blur or Enter, the slider commits while dragging. */
export function MmField({ label, value, min, max, step = 10, onChange, slider = true }: Props) {
	const { t } = useTranslation()
	const id = useId()
	const [draft, setDraft] = useState(String(Math.round(value)))

	useEffect(() => setDraft(String(Math.round(value))), [value])

	const commit = () => {
		const parsed = Number.parseInt(draft.replace(/\D/g, ''), 10)
		if (Number.isNaN(parsed)) {
			setDraft(String(Math.round(value)))
			return
		}
		const clamped = Math.min(Math.max(parsed, min), max)
		setDraft(String(clamped))
		if (clamped !== Math.round(value)) onChange(clamped)
	}

	return (
		<Field label={label} htmlFor={id}>
			<div className="flex items-center gap-3">
				{slider && (
					<Slider
						aria-label={label}
						min={min}
						max={max}
						step={step}
						value={[value]}
						onValueChange={([next]) => next !== undefined && onChange(next)}
						className="flex-1"
					/>
				)}
				<div className="relative w-28 shrink-0">
					<input
						id={id}
						inputMode="numeric"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						onBlur={commit}
						onKeyDown={(event) => {
							if (event.key === 'Enter') commit()
						}}
						className="h-9 w-full rounded-md border border-input bg-transparent pr-9 pl-3 text-right text-body-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>
					<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-caption text-muted-foreground">
						{t('units.mm')}
					</span>
				</div>
			</div>
		</Field>
	)
}
