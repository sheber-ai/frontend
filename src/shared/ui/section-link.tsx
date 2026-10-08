import type * as React from 'react'
import { scrollToSection } from '@/shared/lib/scroll'

type Props = {
	id: string
	className?: string
	children: React.ReactNode
}

/** Scrolls to a section on the current page, or opens the landing at it. */
export function SectionLink({ id, className, children }: Props) {
	return (
		<a
			href={`/#${id}`}
			className={className}
			onClick={(event) => {
				if (scrollToSection(id)) event.preventDefault()
			}}
		>
			{children}
		</a>
	)
}
