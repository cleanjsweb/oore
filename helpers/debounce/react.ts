import { useCallback, useState } from 'react';
import { debounce } from '.';


type TDebounceConfig = Exclude<Parameters<typeof debounce>[1], number>;
type TDelayConfig = number | TDebounceConfig & {
    staging?: boolean;
};


export function useDebouncedState<T extends any>(init: T, config: TDelayConfig) {
	const [debouncedValue, setDebouncedValue] = useState(init);
	const [stagedValue, setStagedValue] = useState(init);

	const enableStaging = typeof config === 'object' && config.staging === true;
	const debounceArgs: Parameters<typeof debounce> = [setDebouncedValue, config];

	const debouncedSetter = useCallback(debounce(...debounceArgs), debounceArgs);

	const setter = useCallback((value: T) => {
		if (enableStaging) {
			setStagedValue(value);
		}
		debouncedSetter(value);
	}, [enableStaging, debouncedSetter]);

	return [debouncedValue, setter, stagedValue] as const;
}
