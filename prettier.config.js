export default {
	arrowParens: "always",
	bracketSpacing: true,
	bracketSameLine: true,

	jsxBracketSameLine: false,
	jsxSingleQuote: false,

	printWidth: 100,
	proseWrap: "preserve",
	quoteProps: "as-needed",
	semi: true,
	singleQuote: true,
	// singleAttributePerLine: false,

	tabWidth: 4,
	trailingComma: "es5",

	/**
	 * Reasons:
	 * - Customizable for all devs in their text editors.
	 * - Provides accessibility benefits.
	 * See: https://github.com/prettier/prettier/issues/7475
	 */
	useTabs: true,

	endOfLine: "auto",
	embeddedLanguageFormatting: "off",
	experimentalTernaries: false,
	htmlWhitespaceSensitivity: "ignore",
};
