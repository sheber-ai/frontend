import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AppHeader } from '@/widgets/app-header'
import { OnboardingGate } from './onboarding-gate'

export function RootLayout() {
	return (
		<TooltipProvider>
			<AppHeader />
			<OnboardingGate />
			<Outlet />
			<Toaster position="top-center" richColors={false} />
			{import.meta.env.DEV && (
				<>
					<TanStackRouterDevtools position="bottom-right" />
					<ReactQueryDevtools buttonPosition="bottom-left" />
				</>
			)}
		</TooltipProvider>
	)
}
