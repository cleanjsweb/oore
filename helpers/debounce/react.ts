import { useCallback, useMemo, useState } from 'react';
import { debounce } from '.';


type TDebounceConfig = Exclude<Parameters<typeof debounce>[1], number>;
type TDelayConfig = number | TDebounceConfig & {
    staging?: boolean;
};


export function useDebouncedState<T extends any>(init: T, config: TDelayConfig) {
	const [debouncedValue, setDebouncedValue] = useState(init);
	const [stagedValue, setStagedValue] = useState(init);
	const [paused, setPaused] = useState(false);

	const enableStaging = typeof config === 'object' && config.staging === true;
	const debounceArgs: Parameters<typeof debounce> = [setDebouncedValue, config];

	const debouncedSetter = useCallback(debounce(...debounceArgs), debounceArgs);

	const setter = useMemo(() => {
		const _setter = (value: T) => {
			if (enableStaging) {
				setStagedValue(value);
			}

			if (paused) {
				console.warn('[useDebouncedState] Skipping debounced state update. Updates were paused with `setter.pause()`. Call `setter.play()` to resume.');
			} else debouncedSetter(value);
		};

		_setter.flush = debouncedSetter.flush;
		_setter.pause = () => setPaused(true);
		_setter.resume = () => setPaused(false);

		return _setter;
	}, [enableStaging, debouncedSetter]);

	return [debouncedValue, setter, stagedValue] as const;
}
