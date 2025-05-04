import { useMemo, useRef } from 'react';
import { CleanState } from './class';
import { TUseCleanState, TCleanState, TInitialState } from './hook-types';


/**
 * Creates a state object, which includes the provided values,
 * as well as helper methods for updating those values and automatically
 * rerendering your component's UI to reflect the updates.
 * 
 * Uses {@link React.useState} under the hood, with a separate call
 * to `useState` for each top-level key in the provided object.
 * 
 * Discussion: [When to `useCleanState`](https://cleanjsweb.github.io/neat-react/documents/Clean_State.html).
 */
export const useCleanState: TUseCleanState = (_initialState, ...props) => {
	type TState = TInitialState<typeof _initialState>;

	const initialState: TState = typeof _initialState === 'function'
		? useMemo(() => _initialState(...props), [])
		: _initialState;
	;

	const cleanState: TCleanState<TState> = useRef(useMemo(() => {
		return new CleanState<TState>(initialState);
	}, [])).current;

	CleanState.update.call(cleanState);
	return cleanState;
};


// Should be valid.
// useCleanState((a: number) => ({b: a.toString(), q: 1}), 6);
// useCleanState((a: boolean) => ({b: a.toString()}), true);
// useCleanState((a: number, c?: string) => ({ b: `${a}` }), 6);
// useCleanState((a: number, c?: string) => ({ b: `${a}` }), 6, 'word');
// useCleanState((a: number, c: string) => ({ b: a + c, f: true }), 6, 'text');
// useCleanState({ d: 5000 });


// Should fail.
// useCleanState((a: number) => ({b: a.toString(), q: 1}), 6, false);
// useCleanState((a: boolean) => ({b: a.toString()}));
// useCleanState((a: number, c?: string) => ({ b: `${a}` }), '6');
// useCleanState((a: number, c?: string) => ({ b: `${a}` }));
// useCleanState((a: number, c: string) => ({ b: a + c, f: true }), 6, 7);
// useCleanState({ d: 5000 }, true);
