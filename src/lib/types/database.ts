export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			cms_content: {
				Row: {
					id: string;
					content: string;
					type: string;
					metadata?: Json;
					updated_at: string;
				};
				Insert: {
					id: string;
					content: string;
					type: string;
					metadata?: Json;
					updated_at?: string;
				};
				Update: {
					id?: string;
					content?: string;
					type?: string;
					metadata?: Json;
					updated_at?: string;
				};
			};
			cms_content_history: {
				Row: {
					id: string;
					content_id: string;
					content: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					content_id: string;
					content: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					content_id?: string;
					content?: string;
					created_at?: string;
				};
			};
		};
		Views: {};
		Functions: {};
		Enums: {};
	};
}
