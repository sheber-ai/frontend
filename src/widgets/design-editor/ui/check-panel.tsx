import { useTranslation } from 'react-i18next'
import { type DesignDocument, DesignSpecsList, type Issue } from '@/entities/furniture'
import { CircleCheck, TriangleAlert } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { nodeLabel } from '../model/node-label'
import type { EditorState } from '../model/use-editor-state'
import { PanelSection } from './panel-section'

type Props = {
	document: DesignDocument
	issues: Issue[]
	select: EditorState['select']
	onShowNode: () => void
}

export function CheckPanel({ document: doc, issues, select, onShowNode }: Props) {
	const { t } = useTranslation()
	return (
		<div className="flex flex-col">
			<PanelSection title={t('editor.check.title')}>
				{issues.length === 0 ? (
					<p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-body-sm">
						<CircleCheck className="size-4 shrink-0 text-success" />
						{t('editor.check.ok')}
					</p>
				) : (
					<ul className="flex flex-col gap-2">
						{issues.map((issue) => (
							<li key={`${issue.code}-${issue.nodeId}`}>
								<button
									type="button"
									disabled={!issue.nodeId}
									onClick={() => {
										if (!issue.nodeId) return
										select(issue.nodeId)
										onShowNode()
									}}
									className={cn(
										'flex w-full gap-2 rounded-lg px-3 py-2 text-left text-body-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default',
										issue.level === 'error'
											? 'bg-destructive/10 text-destructive enabled:hover:bg-destructive/15'
											: 'bg-warning/15 enabled:hover:bg-warning/25',
									)}
								>
									<TriangleAlert className="mt-0.5 size-4 shrink-0" />
									<span className="min-w-0">
										{issue.nodeId && (
											<span className="font-medium">
												{nodeLabel(t, doc.layout, issue.nodeId)}:{' '}
											</span>
										)}
										{t(`issues.${issue.code}`, issue.params)}
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
				<p className="text-body-sm text-muted-foreground">{t('editor.check.hint')}</p>
			</PanelSection>

			<PanelSection title={t('specs.title')}>
				<DesignSpecsList document={doc} />
			</PanelSection>
		</div>
	)
}
