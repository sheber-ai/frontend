import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	computeLayout,
	type DesignDocument,
	DesignViewport,
	hasErrors,
	type ViewMode,
	validateDocument,
} from '@/entities/furniture'
import { AttachmentGallery } from '@/features/manage-attachments'
import { PublishOrderDialog } from '@/features/publish-order'
import type { DesignSchema } from '@/shared/api/generated/model'
import { ArrowLeft, ClipboardList, Redo2, Send, Undo2 } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useAutosave } from '../model/use-autosave'
import { useEditorState } from '../model/use-editor-state'
import { BodyPanel } from './body-panel'
import { CheckPanel } from './check-panel'
import { SaveIndicator } from './save-indicator'
import { SectionPanel } from './section-panel'

type Tab = 'section' | 'body' | 'files' | 'check'

type Props = { design: DesignSchema; document: DesignDocument }

function isTyping(target: EventTarget | null) {
	return (
		target instanceof HTMLElement &&
		(target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
	)
}

export function DesignEditor({ design, document: initial }: Props) {
	const { t } = useTranslation()
	const editor = useEditorState(initial)
	const { document: doc, selectedId, select, undo, redo } = editor
	const [title, setTitle] = useState(design.title)
	const [tab, setTab] = useState<Tab>('body')
	const [mode, setMode] = useState<ViewMode>('3d')
	const [open, setOpen] = useState(false)
	const [dimensions, setDimensions] = useState(true)
	const { status, flush } = useAutosave(design.id, { title, document: doc })

	const layout = useMemo(() => computeLayout(doc), [doc])
	const issues = useMemo(() => validateDocument(doc, layout), [doc, layout])
	const errorCount = issues.filter((issue) => issue.level === 'error').length
	const blocked = hasErrors(issues)

	const selectFromViewport = (id: string | null) => {
		select(id)
		if (id) setTab('section')
	}

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (isTyping(event.target)) return
			const modifier = event.metaKey || event.ctrlKey
			if (modifier && event.key.toLowerCase() === 'z') {
				event.preventDefault()
				if (event.shiftKey) redo()
				else undo()
			} else if (modifier && event.key.toLowerCase() === 'y') {
				event.preventDefault()
				redo()
			} else if (event.key === 'Escape') {
				select(null)
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [undo, redo, select])

	// One unfinished order per design: open it instead of publishing a duplicate
	const publish = design.activeOrder ? (
		<Button asChild variant="outline" className="w-full lg:w-auto">
			<Link to="/orders/$orderId" params={{ orderId: design.activeOrder.id }}>
				<ClipboardList />
				{t('editor.openOrder')}
			</Link>
		</Button>
	) : (
		<PublishOrderDialog
			designId={design.id}
			document={doc}
			warnings={issues.length - errorCount}
			onShowFiles={() => setTab('files')}
			beforePublish={flush}
			blocked={blocked}
			onShowIssues={() => setTab('check')}
		>
			<Button className="w-full lg:w-auto">
				<Send />
				{t('editor.publish')}
			</Button>
		</PublishOrderDialog>
	)

	return (
		<div className="flex flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row">
			<section className="flex min-w-0 flex-col lg:flex-1">
				<div className="flex h-14 items-center gap-2 border-b px-3 sm:px-4">
					<Button variant="ghost" size="icon-sm" asChild>
						<Link to="/projects" aria-label={t('editor.back')}>
							<ArrowLeft />
						</Link>
					</Button>
					<input
						value={title}
						onChange={(event) => setTitle(event.target.value.slice(0, 128))}
						aria-label={t('editor.title')}
						className="h-9 min-w-0 flex-1 rounded-md bg-transparent px-2 text-h4 outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
					/>
					<SaveIndicator status={status} onRetry={() => void flush()} />
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={!editor.canUndo}
							onClick={undo}
							aria-label={t('editor.undo')}
							title={t('editor.undo')}
						>
							<Undo2 />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={!editor.canRedo}
							onClick={redo}
							aria-label={t('editor.redo')}
							title={t('editor.redo')}
						>
							<Redo2 />
						</Button>
					</div>
					<div className="hidden lg:block">{publish}</div>
				</div>
				<DesignViewport
					document={doc}
					selectedId={selectedId}
					onSelect={selectFromViewport}
					mode={mode}
					onModeChange={setMode}
					open={open}
					onOpenChange={setOpen}
					dimensions={dimensions}
					onDimensionsChange={setDimensions}
					className="h-[58svh] min-h-80 lg:h-auto lg:flex-1"
				/>
			</section>

			<aside className="flex min-w-0 flex-col border-t bg-card pb-20 lg:w-[380px] lg:min-h-0 lg:border-t-0 lg:border-l lg:pb-0 xl:w-[420px]">
				<Tabs
					value={tab}
					onValueChange={(value) => setTab(value as Tab)}
					className="gap-0 lg:min-h-0 lg:flex-1"
				>
					<div className="sticky top-16 z-10 border-b bg-card/95 px-3 py-2 backdrop-blur lg:static">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="section">{t('editor.tabs.section')}</TabsTrigger>
							<TabsTrigger value="body">{t('editor.tabs.body')}</TabsTrigger>
							<TabsTrigger value="files">{t('editor.tabs.files')}</TabsTrigger>
							<TabsTrigger value="check" className="gap-1.5">
								{t('editor.tabs.check')}
								{issues.length > 0 && (
									<span
										className={cn(
											'rounded-full px-1.5 text-caption tabular-nums',
											errorCount > 0
												? 'bg-destructive text-destructive-foreground'
												: 'bg-warning text-warning-foreground',
										)}
									>
										{issues.length}
									</span>
								)}
							</TabsTrigger>
						</TabsList>
					</div>
					<div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
						<TabsContent value="section">
							<SectionPanel
								document={doc}
								layout={layout}
								selectedId={selectedId}
								issues={issues}
								apply={editor.apply}
								select={select}
							/>
						</TabsContent>
						<TabsContent value="body">
							<BodyPanel document={doc} apply={editor.apply} />
						</TabsContent>
						<TabsContent value="files">
							<div className="flex flex-col gap-6 p-4">
								<p className="text-body-sm text-muted-foreground">{t('editor.filesHint')}</p>
								{(['reference', 'room', 'document'] as const).map((purpose) => (
									<AttachmentGallery
										key={purpose}
										purpose={purpose}
										target={{ designId: design.id }}
										editable
									/>
								))}
							</div>
						</TabsContent>
						<TabsContent value="check">
							<CheckPanel
								document={doc}
								issues={issues}
								select={select}
								onShowNode={() => setTab('section')}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</aside>

			<div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
				{publish}
			</div>
		</div>
	)
}
