import { useEffect, useRef } from 'react';


/**
 * Returns a value that is false before the component has been mounted,
 * then true during all subsequent rerenders.
 */ 
export const useMountState = () => {
	/**
	 * This must not be a state value. It should not be the cause of a rerender.
	 * It merely provides information about the render count,
	 * without influencing that count itself.
	 * So `mounted` should never be created with `useState`.
	 */
	const mounted = useRef(false);

	useEffect(() => {
		mounted.current = true;

		return () => {
			mounted.current = false;
		}
	}, []);

	return () => mounted.current;
};
