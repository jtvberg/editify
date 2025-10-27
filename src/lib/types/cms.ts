export type ContentType = 'text' | 'rich-text' | 'image' | 'link';

export interface CMSContent {
	id: string; // The data-cms-ref value
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
