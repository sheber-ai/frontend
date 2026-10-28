import { useQueryClient } from '@tanstack/react-query'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	useDeleteAttachment,
	useListAttachmentLimits,
	useListAttachments,
	useReorderAttachments,
	useUpdateAttachment,
} from '@/shared/api/generated/endpoints/attachments/attachments'
import type { AttachmentPurposeEnum, AttachmentSchema } from '@/shared/api/generated/model'
import {
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	ImagePlus,
	Star,
	Trash2,
	TriangleAlert,
	Upload as UploadIcon,
	X,
} from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { acceptFor, formatFileSize, moveId } from '../lib/precheck'
import { type AttachmentTarget, type Upload, useUploads } from '../model/use-uploads'

type Props = {
	purpose: AttachmentPurposeEnum
	/** Where the files hang; a workshop gallery is read by `workshopId` and written to the viewer's workshop */
	target: AttachmentTarget & { workshopId?: string }
	editable: boolean
	/** Captions under photos (portfolio) */
	captions?: boolean
	/** Cover and order matter (galleries shown to others) */
	ordered?: boolean
	/** Hide the heading when the page already has one */
	bare?: boolean
	className?: string
}

const LIMITS_STALE = Number.POSITIVE_INFINITY

function UploadTile({
	upload,
	onRetry,
	onDismiss,
}: {
	upload: Upload
	onRetry: () => void
	onDismiss: () => void
}) {
	const { t } = useTranslation()
	const failed = upload.status === 'error'
	const errorKey = `attachments.errors.${upload.error ?? 'unknown'}`
	return (
		<li className="relative flex aspect-square flex-col overflow-hidden rounded-lg border bg-muted">
			{upload.preview ? (
				<img src={upload.preview} alt="" className={cn('size-full object-cover', 'opacity-50')} />
			) : (
				<span className="flex flex-1 items-center justify-center text-muted-foreground">
					<FileText className="size-8" />
				</span>
			)}
			<div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-card/95 p-2">
				<p className="truncate text-caption">{upload.file.name}</p>
				{failed ? (
					<>
						<p role="alert" className="flex items-start gap-1 text-caption text-destructive">
							<TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
							{t(errorKey, { defaultValue: t('attachments.errors.unknown') })}
						</p>
						<div className="flex gap-1">
							{upload.error !== 'file_type_not_allowed' && upload.error !== 'file_too_large' && (
								<Button size="sm" variant="outline" className="h-8 flex-1" onClick={onRetry}>
									{t('attachments.retry')}
								</Button>
							)}
							<Button
								size="icon"
								variant="ghost"
								className="size-8"
								aria-label={t('attachments.remove')}
								onClick={onDismiss}
							>
								<X />
							</Button>
						</div>
					</>
				) : (
					<div
						role="progressbar"
						aria-label={t('attachments.uploading')}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(upload.progress * 100)}
						className="h-1.5 overflow-hidden rounded-full bg-secondary"
					>
						<div
							className="h-full rounded-full bg-primary transition-[width]"
							style={{ width: `${Math.max(upload.progress, 0.05) * 100}%` }}
						/>
					</div>
				)}
			</div>
		</li>
	)
}

function CaptionField({ attachment }: { attachment: AttachmentSchema }) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const update = useUpdateAttachment()
	const [value, setValue] = useState(attachment.caption)
	const save = async () => {
		if (value.trim() === attachment.caption) return
		try {
			await update.mutateAsync({ attachmentId: attachment.id, data: { caption: value } })
			await invalidatePaths(queryClient, API_PATHS.attachments)
		} catch (error) {
			showError(error)
		}
	}
	return (
		<Input
			value={value}
			maxLength={500}
			onChange={(event) => setValue(event.target.value)}
			onBlur={() => void save()}
			onKeyDown={(event) => {
				if (event.key === 'Enter') event.currentTarget.blur()
			}}
			placeholder={t('attachments.captionPlaceholder')}
			aria-label={t('attachments.caption')}
			className="h-9 text-body-sm"
		/>
	)
}

export function AttachmentGallery({
	purpose,
	target,
	editable,
	captions,
	ordered,
	bare,
	className,
}: Props) {
	const { t, i18n } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const inputId = useId()
	const inputRef = useRef<HTMLInputElement>(null)
	const [viewing, setViewing] = useState<AttachmentSchema | null>(null)
	const limits = useListAttachmentLimits({ query: { staleTime: LIMITS_STALE } })
	const list = useListAttachments({
		workshopId: target.workshopId,
		designId: target.designId,
		orderId: target.orderId,
	})
	const remove = useDeleteAttachment()
	const reorder = useReorderAttachments()
	const limit = limits.data?.find((item) => item.purpose === purpose)
	const items = (list.data?.items ?? []).filter((item) => item.purpose === purpose)
	const single = limit?.maxFiles === 1
	const { uploads, add, retry, dismiss } = useUploads({
		purpose,
		target: { designId: target.designId, orderId: target.orderId },
		limit,
		existing: items.length,
	})

	const refresh = () => invalidatePaths(queryClient, API_PATHS.attachments)
	const move = async (id: string, delta: number) => {
		const ids = moveId(
			items.map((item) => item.id),
			id,
			delta,
		)
		try {
			await reorder.mutateAsync({ data: { ids } })
			await refresh()
		} catch (error) {
			showError(error)
		}
	}
	const destroy = async (id: string) => {
		try {
			await remove.mutateAsync({ attachmentId: id })
			await refresh()
		} catch (error) {
			showError(error)
		}
	}

	if (!editable && !list.isPending && items.length === 0) return null

	const sizeText = limit ? formatFileSize(limit.maxBytes, i18n.language) : ''
	const typesText = limit?.allowPdf ? t('attachments.typesWithPdf') : t('attachments.typesImages')
	const canAdd = editable && limit && (single || items.length + uploads.length < limit.maxFiles)

	return (
		<section className={cn('flex flex-col gap-3', className)}>
			{!bare && (
				<div className="flex flex-col gap-0.5">
					<h3 className="text-body font-medium">{t(`attachments.purposes.${purpose}.title`)}</h3>
					{editable && (
						<p className="text-body-sm text-muted-foreground">
							{t(`attachments.purposes.${purpose}.hint`)}
						</p>
					)}
				</div>
			)}

			{list.isError ? (
				<p className="text-body-sm text-destructive">{t('attachments.loadError')}</p>
			) : list.isPending ? (
				<Skeleton className="h-28" />
			) : (
				<ul
					className={cn(
						'grid gap-3',
						single
							? 'grid-cols-[repeat(auto-fill,minmax(7rem,8rem))]'
							: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4',
					)}
				>
					{items.map((item, index) => (
						<li key={item.id} className="flex min-w-0 flex-col gap-2">
							<div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
								{item.isImage ? (
									<button
										type="button"
										onClick={() => setViewing(item)}
										className="size-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
										aria-label={`${t('attachments.open')}: ${item.name}`}
									>
										<img
											src={item.url}
											alt={item.caption || item.name}
											loading="lazy"
											className="size-full object-cover"
										/>
									</button>
								) : (
									<a
										href={item.url}
										target="_blank"
										rel="noreferrer noopener"
										className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<FileText className="size-8 text-muted-foreground" />
										<span className="line-clamp-2 text-caption break-all">{item.name}</span>
										<span className="text-caption text-muted-foreground">
											{formatFileSize(item.size, i18n.language)}
										</span>
									</a>
								)}
								{editable && ordered && index === 0 && items.length > 1 && (
									<span className="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-caption font-medium">
										<Star className="size-3" />
										{t('attachments.cover')}
									</span>
								)}
								{editable && (
									<div className="absolute inset-x-1 bottom-1 flex justify-end gap-1">
										{ordered && index > 0 && (
											<>
												<Button
													size="icon"
													variant="secondary"
													className="size-8 shadow-xs"
													aria-label={t('attachments.makeCover')}
													title={t('attachments.makeCover')}
													disabled={reorder.isPending}
													onClick={() => void move(item.id, Number.NEGATIVE_INFINITY)}
												>
													<Star />
												</Button>
												<Button
													size="icon"
													variant="secondary"
													className="size-8 shadow-xs"
													aria-label={t('attachments.moveLeft')}
													disabled={reorder.isPending}
													onClick={() => void move(item.id, -1)}
												>
													<ChevronLeft />
												</Button>
											</>
										)}
										{ordered && index < items.length - 1 && (
											<Button
												size="icon"
												variant="secondary"
												className="size-8 shadow-xs"
												aria-label={t('attachments.moveRight')}
												disabled={reorder.isPending}
												onClick={() => void move(item.id, 1)}
											>
												<ChevronRight />
											</Button>
										)}
										<ConfirmDialog
											title={t('attachments.removeTitle')}
											description={t('attachments.removeText')}
											confirmLabel={t('attachments.remove')}
											cancelLabel={t('common.cancel')}
											destructive
											onConfirm={() => void destroy(item.id)}
										>
											<Button
												size="icon"
												variant="secondary"
												className="size-8 text-destructive shadow-xs"
												aria-label={`${t('attachments.remove')}: ${item.name}`}
											>
												<Trash2 />
											</Button>
										</ConfirmDialog>
									</div>
								)}
							</div>
							{captions &&
								(editable ? (
									<CaptionField attachment={item} />
								) : (
									item.caption && <p className="text-body-sm">{item.caption}</p>
								))}
						</li>
					))}
					{uploads.map((upload) => (
						<UploadTile
							key={upload.id}
							upload={upload}
							onRetry={() => retry(upload.id)}
							onDismiss={() => dismiss(upload.id)}
						/>
					))}
					{canAdd && (
						<li>
							<label
								htmlFor={inputId}
								className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center text-body-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
							>
								{single && items.length > 0 ? (
									<UploadIcon className="size-6" />
								) : (
									<ImagePlus className="size-6" />
								)}
								{single && items.length > 0
									? t('attachments.replace')
									: limit?.allowPdf
										? t('attachments.add')
										: t('attachments.addPhotos')}
							</label>
							<input
								ref={inputRef}
								id={inputId}
								type="file"
								multiple={!single}
								accept={limit ? acceptFor(limit) : undefined}
								className="sr-only"
								onChange={(event) => {
									add(Array.from(event.target.files ?? []))
									event.target.value = ''
								}}
							/>
						</li>
					)}
				</ul>
			)}

			{editable && limit && (
				<p className="text-caption text-muted-foreground">
					{single
						? t('attachments.limitsOne', { size: sizeText, types: typesText })
						: t('attachments.limits', { count: limit.maxFiles, size: sizeText, types: typesText })}
				</p>
			)}

			<Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
				<DialogContent className="max-h-[92svh] w-[min(64rem,calc(100vw-2rem))] max-w-none gap-3 p-3 sm:p-4">
					<DialogTitle className="truncate pr-8 text-body">{viewing?.name}</DialogTitle>
					<DialogDescription className={cn(!viewing?.caption && 'sr-only')}>
						{viewing?.caption || viewing?.name}
					</DialogDescription>
					{viewing && (
						<>
							<img
								src={viewing.url}
								alt={viewing.caption || viewing.name}
								className="max-h-[70svh] w-full rounded-md bg-muted object-contain"
							/>
							<Button asChild variant="outline" size="sm" className="self-start">
								<a href={viewing.url} download target="_blank" rel="noreferrer noopener">
									<Download />
									{t('attachments.download')}
								</a>
							</Button>
						</>
					)}
				</DialogContent>
			</Dialog>
		</section>
	)
}
