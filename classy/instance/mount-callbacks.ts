import { useEffect } from 'react';
import { useMountState } from '@/helpers/mount-state';
import { ComponentInstance } from '.';


type UseMountCallbacks = <
	// eslint-disable-next-line no-use-before-define
	TInstance extends ComponentInstance
>(instance: TInstance) => void;


/** @internal */
export const useMountCallbacks: UseMountCallbacks = (instance) => {
	const isMounted = useMountState();

	if (!isMounted()) instance.beforeMount?.();

	useEffect(() => {
		const mountHandlerCleanUp = instance.onMount?.();

		return () => {
			const doCleanUp = (runMountCleaners: IVoidFunction) => {
				runMountCleaners?.();

				instance.cleanUp?.();
			};

			if (typeof mountHandlerCleanUp === 'function') {
				doCleanUp(mountHandlerCleanUp);
			} else {
				mountHandlerCleanUp?.then(doCleanUp);
			}
		};
	}, []);
};
