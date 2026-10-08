import { useTranslation } from 'react-i18next'
import { LogoMark } from '@/shared/design'
import { cn } from '@/shared/lib/utils'

export function Marquee() {
	const { t } = useTranslation()
	const items = t('landing.marquee').split('|')

	return (
		<section className="flex flex-col gap-4 overflow-hidden border-y py-10" aria-hidden="true">
			<MarqueeRow items={items} />
			<MarqueeRow items={[...items].reverse()} reverse />
		</section>
	)
}

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
	// Duplicate content so the -50% translate loops seamlessly
	const loop = [...items, ...items]
	return (
		<div
			className={cn(
				'flex w-max gap-10 motion-reduce:animate-none',
				reverse ? 'animate-marquee-reverse' : 'animate-marquee',
			)}
		>
			{loop.map((item, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: the list is duplicated on purpose
					key={`${item}-${index}`}
					className={cn(
						'flex items-center gap-10 text-h1 whitespace-nowrap sm:text-display',
						reverse
							? 'text-transparent [-webkit-text-stroke:1px_var(--primary)]'
							: 'text-foreground',
					)}
				>
					{item}
					<LogoMark
						className="size-8 text-muted-foreground sm:size-10"
						variant={reverse ? 'mono' : 'brand'}
					/>
				</span>
			))}
		</div>
	)
}
