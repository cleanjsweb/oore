import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse } from 'jsonc-parser';
import { memoize } from './memoize.mjs';


const loadJsonFile = memoize((/** @type {string} */dir, /** @type {string} */fileName) => {
	const tsConfigPath = resolve(dir, fileName);

	try {
		const tsConfigString = readFileSync(tsConfigPath, 'utf8');
		return parse(tsConfigString) || {};
	} catch (error) {
		console.error(error);
		return {};
	}
});

/**
 * @returns {Partial<import('type-fest').TsConfigJson>}
 */
export const loadTsConfig = (projectRoot = process.cwd()) => {
	return loadJsonFile(projectRoot, 'tsconfig.json');
};
