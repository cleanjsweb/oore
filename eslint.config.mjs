import jsdoc from 'eslint-plugin-jsdoc';
import reactPlugin from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';
// import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';


/**
 * Provides a patched copy of the `globals.browser` dependency
 * which removes the problemeatic key that has a trailing space on
 * older versions. Ideally, all versions above `globals@^15` should
 * have this fixed. But it seems some peer dependencies may override
 * the directly installed version (?? 🤷🏽‍♂️).
 */
const patchedBrowserGlobals = Object.assign({}, globals.browser, {
	AudioWorkletGlobalScope: globals.browser['AudioWorkletGlobalScope']
		?? globals.browser['AudioWorkletGlobalScope '],
});
delete patchedBrowserGlobals['AudioWorkletGlobalScope ']; // Removes the errant key.

/**
 * For an unclear reason, eslint seems to require ignored folders to
 * be specified in their own separate config object.
 * 
 * **Do not merge this into the {@link appConfig} object.**    
 * It must remain it's own separate object.
 * @see {@link https://eslint.org/docs/latest/use/configure/ignore#ignoring-directories | Eslint Docs — Ignoring Directories}
 */
const ignoresConfig = {
	ignores: ['build/'],
};

const appConfig = {
	files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.cjs', '**/*.mjs'],
	plugins: {
		jsdoc,
	},
	languageOptions: {
		parser: babelParser,
		parserOptions: {
			babelOptions: {
				presets: [
					'@babel/preset-typescript',
					['babel-preset-react-app', false],
					'babel-preset-react-app/prod',
				],
				// sourceType: 'unambiguous',
				sourceType: 'module',
			},
			requireConfigFile: false,
		},
		globals: {
			...patchedBrowserGlobals,
			...globals.commonjs,
			...globals.node,
		}
	},
	linterOptions: {
		reportUnusedDisableDirectives: 'warn',
	},
	rules: {
		// "prettier/prettier": [ "warn", {}, { "usePrettierrc": true } ],
		// @to-do jsx attributes one per line
		// @to-do jsx attributes double indent
		'no-labels': 'off',
		'no-unused-labels': 'off',
		'default-case': 'off',
		'jsdoc/require-description': 'warn',
		'jsdoc/check-values': 'warn',
		'react/prop-types': 'off',
		'react/no-unescaped-entities': 'off',
		'react/display-name': 'warn',
		'no-use-before-define': 'warn',
		'lines-between-class-members': 'off',

		quotes: ['warn', 'single', { avoidEscape: true }],
		indent: [
			'warn',
			'tab',
			{
				SwitchCase: 1,
				ignoredNodes: ['JSXAttribute', 'JSXSpreadAttribute'],
			},
		],
		'no-param-reassign': ['warn'],
		'max-len': [
			'warn',
			{
				code: 100,
				comments: 200,
				tabWidth: 1, // Count each tab as 1 character. Use zero to ignore indents completely.

				/** Ignore all comments. */
				// ignoreComments: true,

				/** Ignore only trailling comments. */
				ignoreTrailingComments: true,

				/**
				 * Ignores lines matching a regular expression; can only match a single line and
				 * needs to be double escaped when written in YAML or JSON
				 */
				// ignorePattern: /^\s*\/\//,

				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals: true,
			},
		],
		'no-plusplus': ['off'],

		camelcase: 'warn',
		'capitalized-comments': 'off',
		eqeqeq: 'warn',
		'no-nested-ternary': ['warn'],
		'no-else-return': ['off'],
		'no-dupe-keys': 'warn',

		'no-confusing-arrow': ['warn'],
		'arrow-body-style': ['off'],
		'implicit-arrow-linebreak': ['error', 'beside'],

		'prefer-const': ['warn'],
		// 'jsx-a11y/valid-aria-role': 'error',
	},
	settings: {
		/** @see {@link https://github.com/jsx-eslint/eslint-plugin-react#configuration-legacy-eslintrc-} */
		react: {
			// React version. "detect" automatically picks the version you have installed.
			// You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
			// Defaults to the "defaultVersion" setting and warns if missing.
			version: 'detect',

			// Default React version to use when the version you have installed cannot be detected.
			// If not provided, defaults to the latest React version.
			defaultVersion: '18.2',
		},
		'import/resolver': {
			alias: {
				map: [
					['@', './src'],
				],
				extensions: ['.ts', '.js', '.tsx', '.jsx', '.json', '.scss', '.css'],
			},
		},
	},
};

const jsOnlyConfig = {
	files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
	rules: {
		'no-undef': 'warn',
		'no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				varsIgnorePattern: '^_',
				argsIgnorePattern: '^_',
			},
		],
	},
};

const tsOnlyConfig = {
	files: ['**/*.ts', '**/*.tsx'],
	rules: {
		'no-undef': 'off',
		'no-unused-vars': 'off',
	},
};

export default [
	reactPlugin.configs.flat?.recommended, // This is not a plugin object, but a shareable config object
	reactPlugin.configs.flat?.['jsx-runtime'], // Add this if you are using React 17+

	appConfig,
	ignoresConfig,

	jsOnlyConfig,
	tsOnlyConfig,

	// eslintPluginPrettierRecommended,
];
