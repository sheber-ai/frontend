import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RoleBadge, useViewer } from '@/entities/viewer'
import { WorkshopStatusBadge } from '@/entities/workshop'
import { ProfileForm } from '@/features/edit-profile'
import { ArrowRight, Factory } from '@/shared/design'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { toast } from '@/shared/ui/sonner'

export function ProfilePage() {
	const { t } = useTranslation()
	const { viewer } = useViewer()

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('profile.title')} description={viewer?.email ?? undefined} />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
				<div className="rounded-2xl border bg-card p-5 sm:p-8">
					{viewer ? (
						<ProfileForm
							viewer={viewer}
							submitLabel={t('common.save')}
							onSaved={() => toast.success(t('profile.saved'))}
						/>
					) : (
						<Skeleton className="h-64" />
					)}
				</div>
				<aside className="flex flex-col gap-4 lg:self-start">
					<div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
						<p className="text-caption tracking-wider text-muted-foreground uppercase">
							{t('profile.roles')}
						</p>
						<div className="flex flex-wrap gap-1.5">
							{viewer?.roles.map((role) => (
								<RoleBadge key={role} role={role} />
							))}
						</div>
					</div>
					<Link
						to="/workshop"
						className="group flex items-center gap-3 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
							<Factory className="size-5" />
						</span>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="font-medium">{t('profile.workshop')}</span>
							<span className="text-body-sm text-muted-foreground">
								{viewer?.workshopStatus ? (
									<WorkshopStatusBadge status={viewer.workshopStatus} />
								) : (
									t('profile.workshopApply')
								)}
							</span>
						</span>
						<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
					</Link>
				</aside>
			</div>
		</main>
	)
}
