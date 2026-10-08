import { MotionConfig } from 'motion/react'
import { AudienceSection } from './audience-section'
import { BentoSection } from './bento-section'
import { CtaSection } from './cta-section'
import { Hero } from './hero'
import { HowSection } from './how-section'
import { LandingFooter } from './landing-footer'
import { Marquee } from './marquee'

export function LandingPage() {
	return (
		<MotionConfig reducedMotion="user">
			<main>
				<Hero />
				<HowSection />
				<Marquee />
				<AudienceSection />
				<BentoSection />
				<CtaSection />
			</main>
			<LandingFooter />
		</MotionConfig>
	)
}
