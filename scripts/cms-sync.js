#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { globby } from 'globby';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'svelte/compiler';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
// Use service role key for sync script (bypasses RLS)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing Supabase credentials in environment variables');
	console.error('   Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
	console.error('   (Or PUBLIC_SUPABASE_ANON_KEY as fallback, but you may need to adjust RLS policies)');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function extractCMSRefs() {
	console.log('🔍 Scanning Svelte files for CMS refs...\n');

	// Find all Svelte files
	const files = await globby('src/**/*.svelte');

	const refs = new Map();
	const refDetails = new Map();

	for (const file of files) {
		const content = await readFile(file, 'utf-8');

		// Parse with Svelte compiler
		try {
			// Simple regex extraction (more robust than AST parsing for attributes)
			const refMatches = content.matchAll(/data-cms-ref=["']([^"']+)["']/g);
			const typeMatches = content.matchAll(/data-cms-type=["']([^"']+)["']/g);

			const refsInFile = Array.from(refMatches).map((m) => m[1]);
			const typesInFile = Array.from(typeMatches).map((m) => m[1]);

			refsInFile.forEach((ref, index) => {
				const count = refs.get(ref) || 0;
				refs.set(ref, count + 1);

				// Store details about first occurrence
				if (!refDetails.has(ref)) {
					refDetails.set(ref, {
						type: typesInFile[index] || 'text',
						file,
						defaultContent: extractDefaultContent(content, ref)
					});
				}
			});
		} catch (err) {
			console.error(`⚠️  Error parsing ${file}:`, err.message);
		}
	}

	return { refs, refDetails };
}

function extractDefaultContent(content, ref) {
	// Don't try to extract default content from Svelte expressions
	// The content should be added through the CMS UI or manually in the database
	// This avoids storing Svelte code as content
	return '';
}

async function syncToDatabase(refs, refDetails) {
	console.log('📊 Syncing to database...\n');

	let created = 0;
	let existing = 0;
	let errors = 0;

	for (const [ref, count] of refs.entries()) {
		const details = refDetails.get(ref);

		// Check if ref exists in database
		const { data: existingContent } = await supabase
			.from('cms_content')
			.select('id')
			.eq('id', ref)
			.single();

		if (!existingContent) {
			// Create new entry
			const { error } = await supabase.from('cms_content').insert({
				id: ref,
				content: details.defaultContent || '',
				type: details.type
			});

			if (error) {
				console.error(`❌ Error creating ${ref}:`, error.message);
				errors++;
			} else {
				console.log(`✅ Created: ${ref}`);
				console.log(`   Type: ${details.type}`);
				console.log(`   File: ${details.file}`);
				if (details.defaultContent) {
					console.log(`   Content: "${details.defaultContent}"`);
				}
				created++;
			}
		} else {
			existing++;
		}

		// Report on reused refs
		if (count > 1) {
			console.log(`ℹ️  Reused: ${ref} (${count} occurrences)`);
		}

		console.log('');
	}

	// Summary
	console.log('═══════════════════════════════════════');
	console.log('📈 Summary:');
	console.log(`   ✅ Created: ${created}`);
	console.log(`   ⏭️  Already exists: ${existing}`);
	console.log(`   ❌ Errors: ${errors}`);
	console.log(`   📦 Total refs: ${refs.size}`);
	console.log('═══════════════════════════════════════');
}

async function main() {
	console.log('🚀 CMS Sync Tool\n');

	const { refs, refDetails } = await extractCMSRefs();

	if (refs.size === 0) {
		console.log('⚠️  No CMS refs found in Svelte files');
		console.log('   Add data-cms-ref attributes to your components to get started');
		return;
	}

	await syncToDatabase(refs, refDetails);

	console.log('\n✨ Sync complete!');
}

main().catch((err) => {
	console.error('💥 Fatal error:', err);
	process.exit(1);
});
