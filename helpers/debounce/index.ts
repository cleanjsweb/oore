

interface IDebouncedFunction<TFunc extends AnyFunction> {
	(...args: Parameters<TFunc>): Promise<ReturnType<TFunc>>;
	/**
	 * Called internally to trigger the callback with the most recent args
	 * after the delay expires. Can be used to manually trigger the callback
	 * before the normal delay time. If no pending call exists, flush() becomes a no-op.
	 */
	flush: (isEager?: true) => void;
}

export interface IDelayConfig {
	/**
	 * A non-zero delay in milliseconds.
	 * @default 0
	 */
	delay?: number,
	/**
	 * The 'last-call' value specifies that the timer should be applied from the time of the most recent call.
	 * That means each new call while a delay is active will reset the timer, thereby extending the delay.
	 * In other words, it is a "time after inactivity" delay.
	 * Specifying 'first-call' instead will make it use a "time after initial call" delay strategy.
	 */
	anchor?: 'first-call' | 'last-call',
	/**
	 * Controls eager execution behavior:
	 * - `false`: Initial call waits for the delay period before executing.
	 * - `'no-queue'`: Initial call fires immediately. Subsequent calls during the delay period
	 *   are skipped and return the promise from the initial call. Ideal for preventing
	 *   duplicate actions like clicking a download button twice.
	 * - `'with-queue'`: Initial call fires immediately. After the initial flush, the promise
	 *   is discarded. The next call during the delay period creates a new workorder that will
	 *   be maintained until the next flush. Ideal for debounced search inputs and similar use cases.
	 * @default 'with-queue'
	 */
	eager?: false | 'no-queue' | 'with-queue',
}

interface IDebounce {
	<TFunc extends AnyFunction>(
		callback: TFunc,
		delayConfigArg?: number | IDelayConfig,
	): IDebouncedFunction<TFunc>
}


/**
 * Wraps the provided function with a debounce.
 *
 * Behavior during the delay period depends on the `eager` configuration:
 * - `eager: false`: All calls wait for the delay. New calls overwrite the existing call.
 * - `eager: 'no-queue'`: First call fires immediately. Subsequent calls during the delay
 *   period are skipped and return the same promise as the initial call.
 * - `eager: 'with-queue'` (default): First call fires immediately. After the flush, the next call
 *   creates a new workorder that will be fired after the delay. New calls overwrite queued args.
 *
 * Once the timer expires, the most recent call is fired.
 *
 * Note: Returned promises may resolve with values from calls made with
 * different arguments. Avoid using this for functions where argument-specific results matter.
 */
export const debounce: IDebounce = (...init) => {
	const [callback, delayArg] = init;

	const delayConfig: IDelayConfig = {
		delay: 1000,
		anchor: 'first-call',
		eager: 'with-queue',
	};

	if (typeof delayArg === 'number') {
		delayConfig.delay = delayArg || 1000;
	} else if (delayArg) {
		for (const _key in delayArg) {
			const key = _key as keyof IDelayConfig;
			if (delayArg[key] !== undefined) {
				// @ts-expect-error
				delayConfig[key] = delayArg[key];
			}
		}
	}

	type TFunc = typeof callback;

	let nextCall: {
		timeout: NodeJS.Timeout;
		work?: PromiseWithResolvers<ReturnType<TFunc>>;
		args?: Parameters<TFunc>;
	} | null = null;

	const debouncedFunction: IDebouncedFunction<TFunc> = (...args) => {
		let currentWork;

		if (nextCall) {
			if (delayConfig.eager !== 'no-queue') {
				nextCall = {
					...nextCall,
					args,
					work: nextCall.work || Promise.withResolvers<ReturnType<TFunc>>(),
				};
			}

			currentWork = nextCall.work;

			if (delayConfig.anchor === 'last-call') {
				clearTimeout(nextCall.timeout);
				nextCall.timeout = setTimeout(debouncedFunction.flush, delayConfig.delay);
			}
		} else {
			// No active delay, create new call
			nextCall = {
				args,
				timeout: setTimeout(debouncedFunction.flush, delayConfig.delay),
				work: Promise.withResolvers(),
			};

			currentWork = nextCall.work;

			// Fire immediately if eager mode is enabled (no-queue or with-queue)
			if (delayConfig.eager !== false) {
				debouncedFunction.flush(true);
			}
		}

		if (!currentWork) {
			throw new Error('[debounce] `currentWork` was not initialized.');
		}

		return currentWork.promise;
	};

	debouncedFunction.flush = (isEager) => {
		if (!nextCall?.args) {
			nextCall = null;
			// console.log('Queue is empty. Nothing to flush.');
			return;
		}

		// Capture queue values.
		const { resolve, reject } = nextCall.work || {};
		const args = nextCall.args;

		// Clear the queue for new debounced calls.
		if (isEager) {
			delete nextCall.args;
			if (delayConfig.eager === 'with-queue') {
				delete nextCall.work;
			}
		} else {
			nextCall = null;
		}

		// Execute the pending call.
		(async () => {
			try {
				// const result = (await callback(...args)) ?? {};
				// result.__debounceFlushedWithArgs = args;
				resolve?.(await callback(...args));
			} catch (reason: any) {
				reject?.(reason);
			}
		})();
	};

	return debouncedFunction;
};
