import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DESIGN_TEMPLATES } from '@/entities/furniture'
import { FurnitureTypeEnum } from '@/shared/api/generated/model'
import { ArrowRight, Link as LinkIcon, WandSparkles } from '@/shared/design'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Segmented } from '@/shared/ui/segmented'
import { useStartDesign } from '../model/use-start-design'

const URL_PATTERN = /^https?:\/\/\S+\.\S+/

/**
 * Link import. AI recognition is not ready yet: the link is kept as a reference for the workshop
 * and the closest template opens. When the `imports` backend lands, this card will call it instead.
 */
export function LinkImportCard() {
	const { t } = useTranslation()
	const { start, isPending } = useStartDesign()
	const [url, setUrl] = useState('')
	const [type, setType] = useState<FurnitureTypeEnum>(FurnitureTypeEnum.wardrobe)
	const [touched, setTouched] = useState(false)
	const valid = URL_PATTERN.test(url.trim())

	const submit = (event: React.FormEvent) => {
		event.preventDefault()
		setTouched(true)
		const template = DESIGN_TEMPLATES.find((item) => item.furnitureType === type)
		if (!valid || !template) return
		void start(template, { source: 'link', sourceUrl: url.trim() })
	}

	return (
		<form
			onSubmit={submit}
			className="flex h-full flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6"
			noValidate
		>
			<div className="flex items-start justify-between gap-3">
				<span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
					<LinkIcon className="size-5" />
				</span>
				<Badge variant="outline" className="gap-1">
					<WandSparkles />
					{t('start.link.soon')}
				</Badge>
			</div>
			<div className="flex flex-col gap-1">
				<h3 className="text-h4">{t('start.link.title')}</h3>
				<p className="text-body-sm text-muted-foreground">{t('start.link.text')}</p>
			</div>
			<Field
				label={t('start.link.url')}
				htmlFor="import-url"
				error={touched && !valid ? t('form.url') : undefined}
			>
				<Input
					id="import-url"
					type="url"
					inputMode="url"
					placeholder="https://"
					value={url}
					onChange={(event) => setUrl(event.target.value)}
					aria-invalid={touched && !valid}
					className="h-10"
				/>
			</Field>
			<Field label={t('start.link.type')}>
				<Segmented
					label={t('start.link.type')}
					value={type}
					onChange={setType}
					options={Object.values(FurnitureTypeEnum).map((value) => ({
						value,
						label: t(`furnitureTypes.${value}`),
					}))}
				/>
			</Field>
			<Button type="submit" disabled={isPending} className="mt-auto w-full sm:w-auto sm:self-start">
				{t('start.link.submit')}
				<ArrowRight />
			</Button>
		</form>
	)
}
