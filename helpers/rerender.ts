import { useCallback, useRef, useState } from 'react';
import { useMountState } from '@/helpers/mount-state';


interface ICountRef {
	current: number,
};

interface IRefresherReturn {
	/** The last render count just before the rerender was triggered. */
	previousCount: number,
	/** A {@link useRef | RefObject} whose `current` property always has the latest render count. */
	latestCountRef: ICountRef,
}

interface IRefresher {
	(): Promise<IRefresherReturn>;
}

interface IUseRender {
	(): IRefresher & {
		// (): Promise<IRefresherReturn>;
		/** The number of times this instance of the component has been (re)rendered. */
		currentCount: number;
	}
}


/**
 * Returns a function that can be called to manually trigger
 * a rerender of your component.
 */
export const useRerender: IUseRender = () => {
	const isMounted = useMountState();

	const renderCount = useRef(0);
	const [, forceRerender] = useState(renderCount.current);

	renderCount.current++;

	const rerender = useCallback<IRefresher>(() => {
		type TReturn = Awaited<ReturnType<IRefresher>>;
		
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

	const refresher = () => rerender();
	refresher.currentCount = renderCount.current;

	return refresher;
};
