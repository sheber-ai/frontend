import type * as React from 'react'

export function PanelSection({
	title,
	children,
}: {
	title: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-4 border-b px-4 py-5 last:border-b-0 sm:px-5">
			<h3 className="text-caption tracking-wider text-muted-foreground uppercase">{title}</h3>
			{children}
		</section>
	)
}
