

function isPrimitive(/** @type {any} */value) {
	const type = typeof value;

	return (value === null || type !== 'object');
}

export const memoize = (/** @type {AnyFunction} */fn) => {
	/**
	 * Root cache: FIFO array holding at most 3 items (Map or WeakMap).
	 * @type {Array<Map<string, any> | WeakMap<any, any>>}
	 */
	const cacheStack = [];
	const MAX_SIZE = 3;

	const run = (/** @type {any[]} */args = [], /** @type {{force?: boolean}} */options = {}) => {
		const [primitivesKey, objectArgs] = args.reduce((acc, arg) => {
			const group = isPrimitive(arg) ? 0 : 1;

			if (group === 0) acc[group] += `${arg}::`;
			else acc[group].push(arg);

			return acc;
		}, ['::', []]);

		let cachedResult;
		let found = false;

		// Check all 3 items in the stack for a match
		findMatch: for (let i = 0; i < cacheStack.length; i++) {
			const stackIndex = i;
			const currentCache = cacheStack[stackIndex];

			let currentLevel = currentCache;
			let validPath = true;

			drilldown: for (const arg of objectArgs) {
				if (currentLevel instanceof WeakMap) {
					if (currentLevel.has(arg)) {
						currentLevel = currentLevel.get(arg);
					} else {
						validPath = false;
						break drilldown;
					}
				} else {
					validPath = false;
					break drilldown;
				}
			}

			if (validPath && currentLevel instanceof Map && currentLevel.has(primitivesKey)) {
				if (options.force) cacheStack.splice(stackIndex, 1);
				else {
					cachedResult = currentLevel.get(primitivesKey);
					found = true;
				}

				break findMatch;
			}
		};

		if (found) return cachedResult;

		// Cache miss: Compute result
		const computedResult = fn.apply(this, args);

		// Create new cache structure
		const newCache = objectArgs.length > 0 ? new WeakMap() : new Map();
		let insertPoint = newCache;

		// Build nested structure for new result
		objectArgs.forEach((/** @type {any} */arg, /** @type {number} */i) => {
			const isLast = i === objectArgs.length - 1;
			const nextLevel = isLast ? new Map() : new WeakMap();
			
			insertPoint.set(arg, nextLevel);
			insertPoint = nextLevel;
		});

		// Store result at final primitive level
		insertPoint.set(primitivesKey, computedResult);

		// FIFO: Add new cache to front
		cacheStack.push(newCache);
		
		// Remove oldest if > 3
		if (cacheStack.length > MAX_SIZE) {
			cacheStack.shift();
		}

		return computedResult;
	};

	/** @param {string[]} args */
	const memoized = function (...args) {
		return run(args);
	};

	/** @param {string[]} args */
	memoized.force = function (...args)  {
		return run(args, { force: true });
	};

	return memoized;
};
