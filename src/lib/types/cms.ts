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
