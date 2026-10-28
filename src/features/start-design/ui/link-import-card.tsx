import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DESIGN_TEMPLATES, type Size, setSize } from '@/entities/furniture'
import { getErrorCode } from '@/shared/api'
import { importImages, usePreviewImport } from '@/shared/api/generated/endpoints/imports/imports'
import { FurnitureTypeEnum, type ImportPreviewSchema } from '@/shared/api/generated/model'
import { ArrowLeft, ArrowRight, Check, ExternalLink, Info, Link as LinkIcon } from '@/shared/design'
import { formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Segmented } from '@/shared/ui/segmented'
import { toast } from '@/shared/ui/sonner'
import { fitImportedSize, guessFurnitureType } from '../lib/import-draft'
import { useStartDesign } from '../model/use-start-design'

const URL_PATTERN = /^(https?:\/\/)?[^\s/$.?#]+\.[^\s]+$/i
const SIZE_KEYS = ['width', 'height', 'depth'] as const

const templateFor = (type: FurnitureTypeEnum) =>
	DESIGN_TEMPLATES.find((item) => item.furnitureType === type)

type Draft = {
	preview: ImportPreviewSchema
	title: string
	type: FurnitureTypeEnum
	size: Size
	clamped: boolean
	images: string[]
}

function draftFrom(preview: ImportPreviewSchema): Draft {
	const type = guessFurnitureType(preview.title) ?? FurnitureTypeEnum.wardrobe
	const base = templateFor(type)?.build().size ?? { width: 1200, height: 2000, depth: 500 }
	const { size, clamped } = fitImportedSize(preview.size, base)
	return { preview, title: preview.title ?? '', type, size, clamped, images: preview.images }
}

/**
 * Link import: the server reads what the shop page publishes (Open Graph, schema.org) and the client
 * turns it into a project with the shop photos as references. The model itself is built by hand:
 * a page gives a picture and some numbers, not a buildable design.
 */
export function LinkImportCard() {
	const { t, i18n } = useTranslation()
	const { start, isPending: creating } = useStartDesign()
	const preview = usePreviewImport()
	const [url, setUrl] = useState('')
	const [touched, setTouched] = useState(false)
	const [draft, setDraft] = useState<Draft | null>(null)
	const valid = URL_PATTERN.test(url.trim())
	const errorCode = preview.error ? getErrorCode(preview.error) : null

	const read = async (event: React.FormEvent) => {
		event.preventDefault()
		setTouched(true)
		if (!valid) return
		try {
			setDraft(draftFrom(await preview.mutateAsync({ data: { url: url.trim() } })))
		} catch {
			// The error is shown under the field
		}
	}

	const create = async () => {
		if (!draft) return
		const template = templateFor(draft.type)
		if (!template) return
		const source = draft.preview.siteName ?? draft.preview.source
		await start(template, {
			source: 'link',
			sourceUrl: draft.preview.url,
			title: draft.title,
			customize: (document) => setSize(document, draft.size),
			afterCreate:
				draft.images.length > 0
					? async (designId) => {
							const result = await importImages({ designId, imageUrls: draft.images, source })
							if (result.failed > 0)
								toast.warning(t('start.link.imagesFailed', { count: result.failed }))
						}
					: undefined,
		})
	}

	if (draft) {
		const { preview: data } = draft
		const patch = (change: Partial<Draft>) => setDraft({ ...draft, ...change })
		return (
			<div className="flex h-full flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6">
				<div className="flex flex-col gap-1">
					<p className="text-caption tracking-wider text-muted-foreground uppercase">
						{t('start.link.previewEyebrow')}
					</p>
					<a
						href={data.url}
						target="_blank"
						rel="noreferrer noopener"
						className="inline-flex min-w-0 items-center gap-1.5 text-body-sm text-primary hover:underline"
					>
						<span className="truncate">{data.siteName ?? data.source}</span>
						<ExternalLink className="size-3.5 shrink-0" />
					</a>
				</div>

				<Field label={t('start.link.name')} htmlFor="import-title">
					<Input
						id="import-title"
						value={draft.title}
						maxLength={128}
						onChange={(event) => patch({ title: event.target.value })}
						className="h-10"
					/>
				</Field>

				<Field label={t('start.link.type')}>
					<Segmented
						label={t('start.link.type')}
						value={draft.type}
						onChange={(type) => {
							const base = templateFor(type)?.build().size ?? draft.size
							patch({ type, ...fitImportedSize(data.size, base) })
						}}
						options={Object.values(FurnitureTypeEnum).map((value) => ({
							value,
							label: t(`furnitureTypes.${value}`),
						}))}
					/>
				</Field>

				<fieldset className="flex flex-col gap-2">
					<legend className="mb-2 text-body-sm font-medium">
						{data.size ? t('start.link.sizeFromShop') : t('start.link.sizeFromTemplate')}
					</legend>
					<div className="grid grid-cols-3 gap-2">
						{SIZE_KEYS.map((key) => (
							<Field key={key} label={t(`editor.body.${key}`)} htmlFor={`import-${key}`}>
								<Input
									id={`import-${key}`}
									inputMode="numeric"
									value={draft.size[key]}
									onChange={(event) => {
										const value = Number(event.target.value.replace(/\D/g, ''))
										patch({ size: { ...draft.size, [key]: value }, clamped: false })
									}}
									className="h-10 tabular-nums"
								/>
							</Field>
						))}
					</div>
					<p className="text-caption text-muted-foreground">
						{draft.clamped ? t('start.link.sizeClamped') : t('start.link.sizeHint')}
					</p>
				</fieldset>

				{data.images.length > 0 && (
					<fieldset className="flex flex-col gap-2">
						<legend className="mb-2 text-body-sm font-medium">{t('start.link.photos')}</legend>
						<ul className="grid grid-cols-3 gap-2">
							{data.images.map((image) => {
								const selected = draft.images.includes(image)
								return (
									<li key={image}>
										<button
											type="button"
											aria-pressed={selected}
											aria-label={t('start.link.photoToggle')}
											onClick={() =>
												patch({
													images: selected
														? draft.images.filter((item) => item !== image)
														: [...draft.images, image],
												})
											}
											className={cn(
												'relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
												selected ? 'border-primary' : 'border-transparent opacity-50',
											)}
										>
											{/* The shop image is shown straight from the shop: the server copies only the picked ones */}
											<img
												src={image}
												alt=""
												referrerPolicy="no-referrer"
												loading="lazy"
												className="size-full object-cover"
											/>
											{selected && (
												<span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
													<Check className="size-3.5" />
												</span>
											)}
										</button>
									</li>
								)
							})}
						</ul>
					</fieldset>
				)}

				{data.price !== null && (
					<p className="text-body-sm text-muted-foreground">
						{t('start.link.shopPrice', {
							price:
								data.currency === 'KZT' || !data.currency
									? formatMoney(data.price, i18n.language)
									: `${data.price} ${data.currency}`,
						})}
					</p>
				)}

				<p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-body-sm text-muted-foreground">
					<Info className="mt-0.5 size-4 shrink-0" />
					{t('start.link.honest')}
				</p>

				<div className="mt-auto flex flex-col gap-2 sm:flex-row">
					<Button variant="ghost" onClick={() => setDraft(null)} className="w-full sm:w-auto">
						<ArrowLeft />
						{t('common.back')}
					</Button>
					<Button
						onClick={() => void create()}
						disabled={creating || !draft.title.trim()}
						className="w-full sm:w-auto"
					>
						{t('start.link.submit')}
						<ArrowRight />
					</Button>
				</div>
			</div>
		)
	}

	return (
		<form
			onSubmit={read}
			className="flex h-full flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6"
			noValidate
		>
			<span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
				<LinkIcon className="size-5" />
			</span>
			<div className="flex flex-col gap-1">
				<h3 className="text-h4">{t('start.link.title')}</h3>
				<p className="text-body-sm text-muted-foreground">{t('start.link.text')}</p>
			</div>
			<Field
				label={t('start.link.url')}
				htmlFor="import-url"
				error={
					touched && !valid
						? t('form.url')
						: errorCode
							? t(`start.link.errors.${errorCode}`, {
									defaultValue: t('start.link.errors.import_unavailable'),
								})
							: undefined
				}
			>
				<Input
					id="import-url"
					type="url"
					inputMode="url"
					placeholder="https://"
					value={url}
					onChange={(event) => {
						setUrl(event.target.value)
						preview.reset()
					}}
					aria-invalid={(touched && !valid) || Boolean(errorCode)}
					className="h-10"
				/>
			</Field>
			<Button
				type="submit"
				disabled={preview.isPending}
				className="mt-auto w-full sm:w-auto sm:self-start"
			>
				{preview.isPending ? t('start.link.reading') : t('start.link.read')}
				<ArrowRight />
			</Button>
		</form>
	)
}
