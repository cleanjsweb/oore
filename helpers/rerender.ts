import { useCallback, useRef, useState } from 'react';
import { useMountState } from '@/helpers/mount-state';


type TCountRef = { current: number };

interface IRefreshFunction {
	(): Promise<{
		/** The last render count just before the rerender was triggered. */
		previousCount: number,
		/** A {@link useRef | RefObject} whose `current` property always has the latest render count. */
		latestCountRef: TCountRef,
	}>;
	/** The number of times this instance of the component has been (re)rendered. */
	currentCount?: number;
}

interface IRefresher extends Omit<IRefreshFunction, 'currentCount'> {
	/** The number of times this instance of the component has been (re)rendered. */
	currentCount: number;
}


/**
 * Returns a function that can be called to manually trigger
 * a rerender of your component.
 */
export const useRerender = () => {
	const isMounted = useMountState();

	const renderCount = useRef(0);
	const [, forceRerender] = useState(renderCount.current);

	renderCount.current++;

	const rerender = useCallback<IRefreshFunction>(() => {
		type TReturn = Awaited<ReturnType<IRefreshFunction>>;
		
		let resolve: (value: TReturn) => void;
		const promise = new Promise<TReturn>((_r) => resolve = _r);

		const execute = () => {
			forceRerender(renderCount.current);
			resolve({
				previousCount: renderCount.current,
				latestCountRef: renderCount,
			});
		}

		if (isMounted()) execute();
		else {
			setTimeout(() => {
				if (isMounted()) execute();
				else console.log('Cannot rerender an unmounted component.');
			}, 1000);
		}

		return promise;
	}, [forceRerender, renderCount]);

	rerender.currentCount = renderCount.current;

	const output = rerender as IRefresher;
	return output;
};
