import type { ClassComponentHookWrapper } from './types';

import { useEffect } from 'react';


/**
 * A component you can use to consume React hooks
 * in a {@link Component | React.Component} class.
 */
export const Use: ClassComponentHookWrapper = (params) => {
	const { hook: useGenericHook, argumentsList, onUpdate } = params;

	const output = useGenericHook(...argumentsList);

	useEffect(() => {
		onUpdate(output);
	}, [output]);

	return null;
};
