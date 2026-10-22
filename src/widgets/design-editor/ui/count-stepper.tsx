import { useTranslation } from 'react-i18next'
import { Minus, Plus } from '@/shared/design'
import { Button } from '@/shared/ui/button'

type Props = {
	label: string
	value: number
	min: number
	max: number
	onChange: (value: number) => void
}

export function CountStepper({ label, value, min, max, onChange }: Props) {
	const { t } = useTranslation()
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-body-sm">{label}</span>
			<div className="flex items-center gap-1 rounded-lg bg-muted p-1">
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={t('editor.section.less')}
					disabled={value <= min}
					onClick={() => onChange(value - 1)}
				>
					<Minus />
				</Button>
				<output className="w-8 text-center text-body-sm font-semibold tabular-nums">{value}</output>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label={t('editor.section.more')}
					disabled={value >= max}
					onClick={() => onChange(value + 1)}
				>
					<Plus />
				</Button>
			</div>
		</div>
	)
}
