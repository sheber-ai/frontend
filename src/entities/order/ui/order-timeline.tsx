import { useTranslation } from 'react-i18next'
import type { OrderStatusEnum } from '@/shared/api/generated/model'
import { Check, CircleX } from '@/shared/design'
import { cn } from '@/shared/lib/utils'

const STEPS = [
	'published',
	'assigned',
	'in_progress',
	'completed',
] as const satisfies OrderStatusEnum[]

export function OrderTimeline({ status }: { status: OrderStatusEnum }) {
	const { t } = useTranslation()
	if (status === 'cancelled') {
		return (
			<p className="flex items-center gap-2 text-body-sm text-muted-foreground">
				<CircleX className="size-4 text-destructive" />
				{t('orderTimeline.cancelled')}
			</p>
		)
	}
	const current = STEPS.indexOf(status)
	return (
		<ol className="flex flex-col">
			{STEPS.map((step, index) => {
				const done = index < current || status === 'completed'
				const active = index === current && status !== 'completed'
				return (
					<li key={step} className="relative flex gap-3 pb-5 last:pb-0">
						{index < STEPS.length - 1 && (
							<span
								aria-hidden
								className={cn(
									'absolute top-6 left-3 h-[calc(100%-1.5rem)] w-px -translate-x-1/2 bg-border',
									done && 'bg-primary',
								)}
							/>
						)}
						<span
							className={cn(
								'relative flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-caption',
								done && 'border-primary bg-primary text-primary-foreground',
								active && 'border-primary text-primary ring-4 ring-primary/15',
							)}
						>
							{done ? <Check className="size-3.5" /> : index + 1}
						</span>
						<div className="flex flex-col">
							<span
								className={cn(
									'text-body-sm font-medium',
									!done && !active && 'text-muted-foreground',
								)}
							>
								{t(`orderTimeline.${step}.title`)}
							</span>
							{active && (
								<span className="text-body-sm text-muted-foreground">
									{t(`orderTimeline.${step}.text`)}
								</span>
							)}
						</div>
					</li>
				)
			})}
		</ol>
	)
}
