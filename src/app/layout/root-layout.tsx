import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppHeader } from '@/widgets/app-header'

export function RootLayout() {
	return (
		<>
			<AppHeader />
			<Outlet />
			{import.meta.env.DEV && (
				<>
					<TanStackRouterDevtools position="bottom-right" />
					<ReactQueryDevtools buttonPosition="bottom-left" />
				</>
			)}
		</>
	)
}
