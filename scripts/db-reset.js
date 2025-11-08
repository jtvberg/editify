#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing Supabase credentials in environment variables');
	console.error('   Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
	db: { schema: 'public' }
});

async function runSQLFile(filePath, description) {
	console.log(`\n📄 Running ${description}...`);
	try {
		const sql = await readFile(filePath, 'utf-8');
		
		// Split by semicolons but be careful with function definitions
		const statements = sql
			.split(/;(?=\s*(?:--|$|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|COMMENT))/i)
			.map(s => s.trim())
			.filter(s => s && !s.startsWith('--'));
		
		for (const statement of statements) {
			if (statement) {
				const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
				if (error) {
					console.error(`   ⚠️  Error:`, error.message);
				}
			}
		}
		
		console.log(`   ✅ ${description} complete`);
	} catch (err) {
		console.error(`   ❌ Failed to run ${description}:`, err.message);
	}
}

async function main() {
	console.log('🔄 Editify Database Reset\n');
	console.log('═══════════════════════════════════════');
	console.log('This will reset your database to the current baseline:');
	console.log('  - CMS content tables (cms_content, cms_content_history)');
	console.log('  - Repeatable content tables (content_repeatable)');
	console.log('  - Support for Card, Carousel, Section, Tag components');
	console.log('  - Nested repeatables (tags in cards, etc.)');
	console.log('  - RLS policies');
	console.log('═══════════════════════════════════════\n');

	// Run SQL files in order
	await runSQLFile('sql/supabase-schema.sql', 'Base CMS schema');
	await runSQLFile('sql/repeatable-content.sql', 'Repeatable content schema');
	await runSQLFile('sql/supabase-rls-policies.sql', 'CMS RLS policies');
	await runSQLFile('sql/repeatable-rls-policies.sql', 'Repeatable RLS policies');

	console.log('\n═══════════════════════════════════════');
	console.log('✨ Database reset complete!\n');
	console.log('Next steps:');
	console.log('  1. Run: npm run cms:sync');
	console.log('  2. Visit your site and toggle edit mode');
	console.log('  3. Add cards to portfolio page');
	console.log('  4. Add tags to cards');
	console.log('═══════════════════════════════════════\n');
}

main().catch((err) => {
	console.error('💥 Fatal error:', err);
	process.exit(1);
});
