export type ContentType = 'text' | 'html' | 'image';

export interface CMSContent {
	id: string;
	content: string;
	type: ContentType;
	updated_at: string;
}

export interface CMSContentHistory {
	id: string;
	content_id: string;
	content: string;
	created_at: string;
}

export interface CMSStore {
	[key: string]: CMSContent;
}

export interface CMSElementData {
	ref: string;
	type: ContentType;
	element: HTMLElement;
	usageCount: number;
}

// Repeatable Content Types (Reference-Based)
export type RepeatableComponentType = 'Card' | 'Carousel' | 'Section' | 'Tag';

export interface RepeatableItem {
	id: string;
	parent_ref: string;
	component_type: RepeatableComponentType;
	position: number;
	// data contains REFERENCES to cms_content IDs
	// e.g., { title_ref: "portfolio.projects.{uuid}.title", description_ref: "...", image_ref: "..." }
	data: Record<string, string>;
	created_at?: string;
	updated_at?: string;
}

export interface CardData {
	title_ref: string;
	description_ref: string;
	image_ref?: string;
	link_ref?: string;
}

export interface SectionData {
	title_ref: string;
	description_ref: string;
}

export interface RepeatableStore {
	[parentRef: string]: RepeatableItem[];
}
