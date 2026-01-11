import { useMountState } from '@/helpers/mount-state';
import { useCallback, useState } from 'react';


/**
 * Returns a function that can be called to manually trigger
 * a rerender of your component.
 */
export const useRerender = () => {
	const isMounted = useMountState();

	const [key, forceRerender] = useState(Date.now());

	const rerender = useCallback(() => new Promise((resolve, reject) => {
		const execute = () => {
			const key = Date.now();
			forceRerender(key);
			resolve(key);
		}

		if (isMounted()) {
			execute();
			return;
		}

		setTimeout(() => {
			if (isMounted()) {
				execute();
				return;
			}
			else {
				console.log('Cannot rerender an unmounted component.');
			}
		}, 1000);
	}), [forceRerender]);

	// @ts-expect-error
	rerender.key = key;

	return rerender;
};
