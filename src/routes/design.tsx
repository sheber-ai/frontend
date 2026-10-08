import { createFileRoute, notFound } from '@tanstack/react-router'
import { DesignSystemPage } from '@/pages/design-system'

export const Route = createFileRoute('/design')({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound()
	},
	component: DesignSystemPage,
})
