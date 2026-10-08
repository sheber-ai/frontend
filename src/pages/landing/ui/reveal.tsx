import { motion } from 'motion/react'
import type * as React from 'react'

type Props = {
	children: React.ReactNode
	className?: string
	delay?: number
	y?: number
}

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Fades content in once it enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 28 }: Props) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y, filter: 'blur(6px)' }}
			whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
			viewport={{ once: true, margin: '0px 0px -12% 0px' }}
			transition={{ duration: 0.8, delay, ease: EASE_OUT }}
		>
			{children}
		</motion.div>
	)
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center gap-2 text-caption tracking-widest text-primary uppercase">
			<span className="h-px w-8 bg-primary" />
			{children}
		</span>
	)
}
