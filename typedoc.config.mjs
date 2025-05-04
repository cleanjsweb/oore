//@ts-check
/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
	alwaysCreateEntryPointModule: true,
	entryPoints: [ './docs-src/api'/* , './helpers' */ ],
	out: 'docs',
	// out: 'api-docs',
	entryPointStrategy: 'resolve',
	plugin: [
		// 'typedoc-plugin-markdown',
		// '@shipgirl/typedoc-plugin-versions',
		// '@8hobbies/typedoc-plugin-404',
		// 'typedoc-plugin-include-example',
		// 'typedoc-plugin-redirect',
		'typedoc-plugin-mdn-links',
		'typedoc-plugin-coverage',
	],
	"validation": {
		"notExported": true,
		"invalidLink": true,
		"rewrittenLink": true,
		"notDocumented": true,
		"unusedMergeModuleWith": true
	},
	"requiredToBeDocumented": [
		//"Project",
		"Module",
		//"Namespace",
		"Enum",     "EnumMember", "Variable",
		"Function", "Class",      "Interface",
		// "Constructor",
		"Property", "Method",
		/**
		 * Implicitly set if function/method is set (this means you can't require docs on methods, but not functions)
		 * This exists because methods/functions can have multiple signatures due to overloads, and TypeDoc puts comment
		 * data on the signature. This might be improved someday, so you probably shouldn't set this directly.
		 */
		// "CallSignature",
		/** Index signature { [k: string]: string } "properties" */
		// "IndexSignature",
		/** Equivalent to Constructor due to the same implementation detail as CallSignature */
		// "ConstructorSignature",
		// "Parameter",
		/** 
		 * Used for object literal types. You probably should set TypeAlias instead,
		 * which refers to types created with `type X =`.
		 * This only really exists because of an implementation detail.
		 */
		// "TypeLiteral",
		// "TypeParameter",
		"Accessor", // shorthand for GetSignature + SetSignature
		// "GetSignature",
		// "SetSignature",
		"TypeAlias"
		/** 
		 * TypeDoc creates reference reflections if a symbol is exported
		 * from a package with multiple names. Most projects won't have
		 * any of these, and they just render as a link to the canonical name.
		 */
		// "Reference",
	],
	// excludeNotDocumented: true,
	// "excludeNotDocumentedKinds": ["Property", "Interface", "TypeAlias"]
	// externalPattern: 'standalone-docs/**/*.md',
	exclude: ["**/internal/**/*"],
	projectDocuments: ["docs-src/**/*.root.md"],
	excludeInternal: true,
	// name: 'Oore',
	includeVersion: true,
	disableSources: true,
	groupReferencesByType: false,
	"navigation": {
		"includeCategories": false,
		"includeGroups": false,
		"includeFolders": false,
		"compactFolders": false,
		"excludeReferences": true,
	},
	categorizeByGroup: false,
	// groupOrder: ["ComponentLogic", "*"],
	// defaultCategory: "Others",
	categoryOrder: ["Base Tools", 'Advanced Tools', 'External Classes', 'Types', 'Helpers', "*"],
	sort: [
		// "enum-value-ascending",
		// "enum-value-descending",
		// "enum-member-source-order",
		// "instance-first",
		// "visibility",
		// "required-first",
		// "external-last",
		"documents-first",
		"static-first",
		"kind",
		"source-order",
		// "alphabetical-ignoring-documents",
		"alphabetical",
		// "documents-last",
	],
	sortEntryPoints: true,
	kindSortOrder: [
		"Function",
		"Class",
		"Reference",
		"Project",
		"Module",
		"Namespace",
		"Enum",
		"EnumMember",
		"Interface",
		"TypeAlias",
		"Constructor",
		"Property",
		"Variable",
		"Accessor",
		"Method",
		"Parameter",
		"TypeParameter",
		"TypeLiteral",
		"CallSignature",
		"ConstructorSignature",
		"IndexSignature",
		"GetSignature",
		"SetSignature",
	],
	highlightLanguages: ['jsx', 'tsx', 'ts', 'js', 'css', 'scss', 'html'],
};

export default config;
