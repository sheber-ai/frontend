import { motion } from 'motion/react'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Box, Camera, Hammer } from '@/shared/design'
import { scrollToSection } from '@/shared/lib/scroll'
import { Button } from '@/shared/ui/button'
import { Text } from '@/shared/ui/typography'
import { useGetStarted } from '../model/use-get-started'
import { Configurator } from './configurator'
import { EASE_OUT } from './reveal'

export function Hero() {
	const getStarted = useGetStarted()
	const { t } = useTranslation()
	const words = t('landing.hero.title').split(' ')

	return (
		<section className="relative isolate overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-blueprint opacity-60 mask-[linear-gradient(to_bottom,black,transparent_85%)]" />
			<div className="page-container grid grid-cols-1 items-center gap-10 py-8 sm:gap-12 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-20 2xl:gap-24">
				<div className="flex min-w-0 flex-col items-start gap-6 lg:gap-8">
					<motion.span
						className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-body-sm text-muted-foreground"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<span className="relative flex size-2">
							<span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-brand-sage" />
							<span className="relative inline-flex size-2 rounded-full bg-brand-sage" />
						</span>
						{t('landing.hero.eyebrow')}
					</motion.span>

					<h1 className="text-hero text-balance">
						<span className="block">
							{words.map((word, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: words are a static, ordered list
									key={`${word}-${index}`}
									className="inline-block overflow-hidden pb-1 align-bottom"
								>
									<motion.span
										className="inline-block"
										initial={{ y: '110%' }}
										animate={{ y: 0 }}
										transition={{ duration: 0.8, delay: 0.1 + index * 0.07, ease: EASE_OUT }}
									>
										{word}&nbsp;
									</motion.span>
								</span>
							))}
						</span>
						<motion.span
							className="relative inline-block text-primary"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.45, ease: EASE_OUT }}
						>
							{t('landing.hero.titleAccent')}
							<svg
								viewBox="0 0 300 12"
								preserveAspectRatio="none"
								className="absolute -bottom-2 left-0 h-3 w-full fill-none stroke-primary/50"
								aria-hidden="true"
							>
								<motion.path
									d="M2 9 C 60 2, 140 2, 200 6 S 280 10, 298 4"
									strokeWidth={3}
									strokeLinecap="round"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ duration: 0.9, delay: 1, ease: 'easeInOut' }}
								/>
							</svg>
						</motion.span>
					</h1>

					<FadeIn delay={0.6}>
						<Text size="lg" tone="muted" className="max-w-xl text-balance">
							{t('landing.hero.subtitle')}
						</Text>
					</FadeIn>

					<FadeIn delay={0.75} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<Button size="lg" onClick={() => getStarted()} className="group">
							{t('landing.hero.ctaPrimary')}
							<ArrowRight className="transition-transform group-hover:translate-x-0.5" />
						</Button>
						<Button size="lg" variant="outline" onClick={() => scrollToSection('how')}>
							{t('landing.hero.ctaSecondary')}
						</Button>
					</FadeIn>

					<FadeIn delay={0.9}>
						<ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-caption text-muted-foreground sm:gap-2 sm:text-body-sm [&_svg]:size-3.5 sm:[&_svg]:size-4">
							<FlowStep icon={<Camera />}>{t('landing.hero.flowPhoto')}</FlowStep>
							<ArrowRight className="shrink-0 text-border" />
							<FlowStep icon={<Box />}>{t('landing.hero.flowModel')}</FlowStep>
							<ArrowRight className="shrink-0 text-border" />
							<FlowStep icon={<Hammer />}>{t('landing.hero.flowWorkshop')}</FlowStep>
						</ol>
					</FadeIn>
				</div>

				<FadeIn delay={0.3} y={32}>
					<Configurator />
				</FadeIn>
			</div>
		</section>
	)
}

type FadeInProps = {
	delay: number
	y?: number
	className?: string
	children: React.ReactNode
}

function FadeIn({ delay, y = 16, className, children }: FadeInProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, delay, ease: EASE_OUT }}
		>
			{children}
		</motion.div>
	)
}

function FlowStep({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<li className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 whitespace-nowrap text-secondary-foreground sm:gap-1.5 sm:px-2.5">
			{icon}
			{children}
		</li>
	)
}
