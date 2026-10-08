import { useTranslation } from 'react-i18next'
import { ENABLED_LANGUAGES, LANGUAGE_LABELS } from '@/shared/config'
import { cn } from '@/shared/lib/utils'

export function LanguageSwitcher() {
	const { t, i18n } = useTranslation()

	return (
		<fieldset
			aria-label={t('language.label')}
			className="inline-flex rounded-md bg-muted p-0.5 text-caption"
		>
			{ENABLED_LANGUAGES.map((language) => {
				const isActive = i18n.language === language
				return (
					<button
						key={language}
						type="button"
						lang={language}
						aria-pressed={isActive}
						onClick={() => void i18n.changeLanguage(language)}
						className={cn(
							'rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:text-foreground',
							isActive && 'bg-background text-foreground shadow-xs',
						)}
					>
						{LANGUAGE_LABELS[language]}
					</button>
				)
			})}
		</fieldset>
	)
}
