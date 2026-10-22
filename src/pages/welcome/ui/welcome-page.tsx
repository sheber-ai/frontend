import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useViewer } from '@/entities/viewer'
import { ProfileForm } from '@/features/edit-profile'
import { Factory, LogoMark, Ruler } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

type Intent = 'client' | 'workshop'

export function WelcomePage() {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const navigate = useNavigate()
	const [intent, setIntent] = useState<Intent>('client')

	const options: { value: Intent; icon: React.ReactNode }[] = [
		{ value: 'client', icon: <Ruler /> },
		{ value: 'workshop', icon: <Factory /> },
	]

	return (
		<main className="page-container grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:py-16">
			<div className="flex flex-col gap-4">
				<LogoMark className="size-12" />
				<h1 className="text-h2 text-balance sm:text-h1">{t('welcome.title')}</h1>
				<p className="max-w-lg text-body-lg text-muted-foreground">{t('welcome.text')}</p>
			</div>

			<div className="flex flex-col gap-8 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
				<fieldset className="flex flex-col gap-3">
					<legend className="mb-3 text-h4">{t('welcome.who')}</legend>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{options.map((option) => {
							const active = intent === option.value
							return (
								<button
									key={option.value}
									type="button"
									aria-pressed={active}
									onClick={() => setIntent(option.value)}
									className={cn(
										'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-5',
										active && 'border-primary bg-primary/5 hover:bg-primary/10',
									)}
								>
									<span className={cn('text-muted-foreground', active && 'text-primary')}>
										{option.icon}
									</span>
									<span className="font-medium">{t(`welcome.intent.${option.value}.title`)}</span>
									<span className="text-body-sm text-muted-foreground">
										{t(`welcome.intent.${option.value}.text`)}
									</span>
								</button>
							)
						})}
					</div>
				</fieldset>

				<div className="flex flex-col gap-4">
					<h2 className="text-h4">{t('welcome.contacts')}</h2>
					<p className="-mt-2 text-body-sm text-muted-foreground">{t('welcome.contactsHint')}</p>
					{viewer ? (
						<ProfileForm
							viewer={viewer}
							submitLabel={t('welcome.submit')}
							onSaved={() =>
								void navigate({
									to: intent === 'workshop' ? '/workshop' : '/projects/new',
									replace: true,
								})
							}
						/>
					) : (
						<Skeleton className="h-64" />
					)}
				</div>
			</div>
		</main>
	)
}
