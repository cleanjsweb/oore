import * as fs from 'node:fs'; 
import { defineConfig } from 'tsup';
import { loadTsConfig } from './@config/build-scripts/load-ts-config.mjs';


const tsConfig = loadTsConfig(process.cwd());

function getFilteredEntries(tsconfig: any): string[] {
	const includePatterns: string[] = tsconfig.include || [];
	const excludePatterns: string[] = tsconfig.exclude || [];

	// Expand all inclusion globs into absolute/relative file paths
	const allFiles = includePatterns.flatMap((pattern) => fs.globSync(pattern));

	if (excludePatterns.length === 0) {
		return allFiles;
	}

	// Expand all exclusion globs to cross-reference
	const excludedFiles = new Set(
		excludePatterns.flatMap((pattern) => fs.globSync(pattern))
	);

	// Filter out any file found in the excluded files set
	return allFiles.filter((file) => !excludedFiles.has(file));
}

const entries = getFilteredEntries(tsConfig);

export default defineConfig({
	// 1. Points to your main entry file(s)
	entry: entries,

	bundle: false,
	outDir: tsConfig.compilerOptions?.outDir || 'build',

	// 2. Compiles to clean native modern ESM and legacy-compatible CJS tracks
	format: ['esm', 'cjs'],

	// 3. Emits type declarations (.d.ts) natively
	dts: {
		// Forces tsup to use standard tsc compilation for individual files 
		// instead of invoking Rollup's type-bundling engine.
		entry: entries,
	},

	// 4. Cleans out the dist folder before every build run
	clean: true,

	// 5. Splits code safely if you add multiple entries down the line
	splitting: false,

	sourcemap: true,
	minify: false,

	// 6. Automatically hooks into your tsconfig paths (replaces tsc-alias)
	tsconfig: './tsconfig.json',

	// 6. CRITICAL: Tells esbuild to calculate relative directory paths starting at "src"
	esbuildOptions(options) {
		options.outbase = '.';
	},
});
