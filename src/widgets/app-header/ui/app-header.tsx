import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getViewerName, useViewer } from '@/entities/viewer'
import { login, register } from '@/shared/auth'
import { LANDING_SECTIONS } from '@/shared/config'
import { Logo } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { SectionLink } from '@/shared/ui/section-link'
import { navItems } from '../model/nav'
import { AccountMenu } from './account-menu'
import { LanguageSwitcher } from './language-switcher'
import { MobileMenu } from './mobile-menu'
import { NotificationsMenu } from './notifications-menu'

export function AppHeader() {
	const { t } = useTranslation()
	const { isAuthenticated, viewer } = useViewer()
	const pathname = useRouterState({ select: (state) => state.location.pathname })
	const items = isAuthenticated ? navItems(viewer) : []

	return (
		<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
			<div className="page-container flex h-16 items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-8">
					<Link to="/" aria-label={t('app.name')}>
						<Logo wordmarkClassName="max-sm:hidden" />
					</Link>

					{isAuthenticated ? (
						<nav className="hidden items-center gap-1 lg:flex">
							{items.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									activeOptions={{ exact: item.to === '/market' }}
									className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-body-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground [&_svg]:size-4"
								>
									<item.icon />
									{t(`nav.${item.label}`)}
								</Link>
							))}
						</nav>
					) : (
						pathname === '/' && (
							<nav className="hidden items-center gap-6 text-body-sm lg:flex">
								{LANDING_SECTIONS.map((id) => (
									<SectionLink
										key={id}
										id={id}
										className="text-muted-foreground transition-colors hover:text-foreground"
									>
										{t(`landing.nav.${id}`)}
									</SectionLink>
								))}
							</nav>
						)
					)}
				</div>

				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					{isAuthenticated ? (
						<>
							<NotificationsMenu />
							<AccountMenu
								name={viewer ? getViewerName(viewer) : t('header.profile')}
								className="max-lg:hidden"
							/>
							<MobileMenu items={items} name={viewer ? getViewerName(viewer) : ''} />
						</>
					) : (
						<>
							<Button variant="ghost" size="sm" onClick={() => void login()}>
								{t('header.login')}
							</Button>
							<Button size="sm" className={cn('max-sm:hidden')} onClick={() => void register()}>
								{t('header.register')}
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	)
}
