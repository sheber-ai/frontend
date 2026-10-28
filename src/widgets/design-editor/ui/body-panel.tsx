import { useTranslation } from 'react-i18next'
import {
	type DesignDocument,
	type FacadeType,
	HANDLE_TYPES,
	type HandleType,
	handleType,
	LIMITS,
	setFacade,
	setHandles,
	setMaterials,
	setPlinth,
	setSize,
} from '@/entities/furniture'
import { Columns3, DoorClosed, LibraryBig } from '@/shared/design'
import { Field } from '@/shared/ui/field'
import { Segmented } from '@/shared/ui/segmented'
import type { EditorState } from '../model/use-editor-state'
import { MaterialPicker } from './material-picker'
import { MmField } from './mm-field'
import { PanelSection } from './panel-section'

type Props = { document: DesignDocument; apply: EditorState['apply'] }

export function BodyPanel({ document: doc, apply }: Props) {
	const { t } = useTranslation()
	const { size } = doc

	return (
		<div className="flex flex-col">
			<PanelSection title={t('editor.body.size')}>
				<MmField
					label={t('editor.body.width')}
					value={size.width}
					{...LIMITS.width}
					onChange={(width) => apply((current) => setSize(current, { width }), 'width')}
				/>
				<MmField
					label={t('editor.body.height')}
					value={size.height}
					{...LIMITS.height}
					onChange={(height) => apply((current) => setSize(current, { height }), 'height')}
				/>
				<MmField
					label={t('editor.body.depth')}
					value={size.depth}
					{...LIMITS.depth}
					onChange={(depth) => apply((current) => setSize(current, { depth }), 'depth')}
				/>
				<MmField
					label={t('editor.body.plinth')}
					value={doc.plinth}
					{...LIMITS.plinth}
					step={5}
					onChange={(plinth) => apply((current) => setPlinth(current, plinth), 'plinth')}
				/>
			</PanelSection>

			<PanelSection title={t('editor.body.materials')}>
				<MaterialPicker
					label={t('editor.body.bodyMaterial')}
					value={doc.materials.body}
					onChange={(body) => apply((current) => setMaterials(current, { body }))}
				/>
				<MaterialPicker
					label={t('editor.body.frontMaterial')}
					value={doc.materials.fronts}
					onChange={(fronts) => apply((current) => setMaterials(current, { fronts }))}
				/>
			</PanelSection>

			<PanelSection title={t('editor.body.facade')}>
				<Segmented<FacadeType>
					label={t('editor.body.facade')}
					layout="grid"
					className="sm:grid-cols-3"
					value={doc.facade.type}
					onChange={(type) => apply((current) => setFacade(current, type))}
					options={[
						{ value: 'open', label: t('editor.facade.open'), icon: <LibraryBig /> },
						{ value: 'hinged', label: t('editor.facade.hinged'), icon: <DoorClosed /> },
						{ value: 'sliding', label: t('editor.facade.sliding'), icon: <Columns3 /> },
					]}
				/>
				<p className="text-body-sm text-muted-foreground">
					{t(`editor.facade.${doc.facade.type}Hint`)}
				</p>
				<Field label={t('editor.handles.label')}>
					<Segmented<HandleType>
						label={t('editor.handles.label')}
						value={handleType(doc)}
						onChange={(handles) => apply((current) => setHandles(current, handles))}
						options={HANDLE_TYPES.map((value) => ({
							value,
							label: t(`editor.handles.${value}`),
						}))}
					/>
				</Field>
				<p className="text-body-sm text-muted-foreground">
					{t(`editor.handles.${handleType(doc)}Hint`)}
				</p>
				{doc.facade.type === 'sliding' && (
					<Field label={t('editor.facade.panels')}>
						<Segmented
							label={t('editor.facade.panels')}
							value={String(doc.facade.panels)}
							onChange={(panels) =>
								apply((current) => setFacade(current, 'sliding', Number(panels)))
							}
							options={[2, 3, 4].map((count) => ({ value: String(count), label: String(count) }))}
						/>
					</Field>
				)}
			</PanelSection>
		</div>
	)
}
