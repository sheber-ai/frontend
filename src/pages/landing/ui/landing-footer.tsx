import { useTranslation } from 'react-i18next'
import { LANDING_SECTIONS } from '@/shared/config'
import { Logo } from '@/shared/design'
import { SectionLink } from '@/shared/ui/section-link'
import { Text } from '@/shared/ui/typography'

export function LandingFooter() {
	const { t } = useTranslation()

	return (
		<footer className="border-t">
			<div className="page-container flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
				<div className="flex flex-col gap-3">
					<Logo />
					<Text size="sm" tone="muted" className="max-w-xs">
						{t('landing.footer.tagline')}
					</Text>
				</div>
				<nav className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm">
					{LANDING_SECTIONS.map((id) => (
						<SectionLink key={id} id={id} className="text-muted-foreground hover:text-foreground">
							{t(`landing.nav.${id}`)}
						</SectionLink>
					))}
				</nav>
				<Text size="caption" tone="muted">
					{t('landing.footer.rights', { year: new Date().getFullYear() })}
				</Text>
			</div>
		</footer>
	)
}
