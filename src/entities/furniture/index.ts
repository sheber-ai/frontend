export {
	type Axis,
	type CellNode,
	type DesignDocument,
	type Door,
	FACADE_TYPES,
	type FacadeType,
	FILL_TYPES,
	type Fill,
	type FillType,
	type Hinge,
	isDesignDocument,
	type LayoutNode,
	LIMITS,
	PANEL,
	parseDocument,
	type Size,
	type SplitNode,
} from './model/document'
export { computeLayout, type Layout, type NodeLayout, type Rect } from './model/layout'
export {
	addSection,
	cloneWithNewIds,
	divideCell,
	findNode,
	findParent,
	pathTo,
	removeNode,
	setAxis,
	setChildSize,
	setDoor,
	setFacade,
	setFill,
	setMaterials,
	setPlinth,
	setSize,
} from './model/operations'
export {
	hasErrors,
	type Issue,
	type IssueCode,
	type IssueLevel,
	RULES,
	validateDocument,
} from './model/rules'
export { DEFAULT_SKETCH, SKETCH_LIMITS, type WardrobeSketch } from './model/sketch'
export { type DesignSpecs, summarizeDesign } from './model/specs'
export {
	DESIGN_TEMPLATES,
	type DesignTemplate,
	getTemplate,
	type TemplateId,
} from './model/templates'
export { DesignCard } from './ui/design-card'
export { DesignDrawing } from './ui/design-drawing'
export { DesignScene, type DesignSceneProps } from './ui/design-scene-lazy'
export { DesignSpecsList } from './ui/design-specs'
export { DesignThumbnail } from './ui/design-thumbnail'
export { DesignViewport, type ViewMode } from './ui/design-viewport'
export { WardrobeDrawing } from './ui/wardrobe-drawing'
