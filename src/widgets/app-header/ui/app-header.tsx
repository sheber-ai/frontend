import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getViewerName, useViewer } from '@/entities/viewer'
import { login, logout, register } from '@/shared/auth'
import { LANDING_SECTIONS } from '@/shared/config'
import { LogOut, Logo, User } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { SectionLink } from '@/shared/ui/section-link'
import { LanguageSwitcher } from './language-switcher'

export function AppHeader() {
	const { t } = useTranslation()
	const { isAuthenticated, viewer, isPending } = useViewer()

	return (
		<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
			<div className="page-container flex h-16 items-center justify-between gap-3">
				<Link to="/" aria-label={t('app.name')}>
					<Logo wordmarkClassName="max-sm:hidden" />
				</Link>

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

				<nav className="flex items-center gap-2">
					<LanguageSwitcher />
					{isAuthenticated ? (
						<>
							<Button variant="ghost" size="sm" asChild>
								<Link to="/profile">
									<User />
									<span className="max-sm:hidden">
										{viewer && !isPending ? getViewerName(viewer) : t('header.profile')}
									</span>
								</Link>
							</Button>
							<Button variant="outline" size="sm" onClick={() => void logout()}>
								<LogOut />
								<span className="max-sm:hidden">{t('header.logout')}</span>
							</Button>
						</>
					) : (
						<>
							<Button variant="ghost" size="sm" onClick={() => void login()}>
								{t('header.login')}
							</Button>
							<Button size="sm" className="max-sm:hidden" onClick={() => void register()}>
								{t('header.register')}
							</Button>
						</>
					)}
				</nav>
			</div>
		</header>
	)
}
