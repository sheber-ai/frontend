import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, LogoMark } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { useGetStarted } from '../model/use-get-started'
import { Reveal } from './reveal'

export function CtaSection() {
	const getStarted = useGetStarted()
	const { t } = useTranslation()
	const section = useRef<HTMLElement>(null)
	const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
	const rotate = useTransform(scrollYProgress, [0, 1], [-25, 25])
	const y = useTransform(scrollYProgress, [0, 1], [80, -80])

	return (
		<section ref={section} className="dark relative overflow-hidden bg-background text-foreground">
			<div className="absolute inset-0 bg-blueprint opacity-40" />
			<motion.div
				className="absolute -right-24 -bottom-24 opacity-20 lg:right-10"
				style={{ rotate, y }}
			>
				<LogoMark className="size-72 sm:size-[28rem]" />
			</motion.div>

			<div className="page-container relative flex flex-col items-start gap-8 py-24 lg:py-36">
				<Reveal>
					<h2 className="max-w-3xl text-h1 text-balance sm:text-display">
						{t('landing.cta.title')}{' '}
						<span className="text-primary">{t('landing.cta.titleAccent')}</span>
					</h2>
				</Reveal>
				<Reveal delay={0.1}>
					<Text size="lg" tone="muted" className="max-w-xl">
						{t('landing.cta.text')}
					</Text>
				</Reveal>
				<Reveal delay={0.2} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button size="lg" onClick={() => getStarted()}>
						{t('landing.cta.primary')}
						<ArrowRight />
					</Button>
					<Button size="lg" variant="outline" onClick={() => getStarted('workshops')}>
						{t('landing.cta.secondary')}
					</Button>
				</Reveal>
			</div>
		</section>
	)
}
