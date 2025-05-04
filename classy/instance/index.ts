import type { UIParams, UIReturn, UseInstance } from './types/hook';
import type { TPropsBase } from '@/classy/logic';

import { useEffect } from 'react';

import { ComponentLogic, useLogic } from '@/classy/logic';
import { useMountCallbacks } from './mount-callbacks';
import { noOp } from '@/helpers';

// @todo Use rollup. Insert globals.ts reference tag to all d.ts output files.


type AsyncAllowedEffectCallback = () => Awaitable<IVoidFunction>;


/**
 * A superset of {@link ComponentLogic} that adds support for lifecycle methods.
 * This provides a declarative API for working with your React function component's lifecycle,
 * a simpler alternative to the imperative approach with `useEffect` and/or `useMemo`.
 * 
 * @see https://github.com/cleanjsweb/neat-react#lifecycle-useinstance
 */
export class ComponentInstance<TProps extends TPropsBase = null>
		extends ComponentLogic<TProps> {
	/**
	 * Runs only _before_ the first render,
	 * i.e before the component instance is mounted.
	 * 
	 * It is ignored on subsequent rerenders.
	 * Uses `useMemo()` under the hood.
	 * 
	 * PS: You can conditionally update state from here, but with certain caveats.
	 * {@link https://react.dev/reference/react/useState#storing-information-from-previous-renders | See the React docs for details}.
	 */
	beforeMount: IVoidFunction = () => {};

	/**
	 * Runs only **_after_** the first render, i.e after the component instance is mounted.
	 * It is ignored on subsequent rerenders.
	 * 
	 * Should usually only be used for logic that does not directly take part in determining what to render, like
	 * logging and analytics.
	 * 
	 * @returns A cleanup function.
	 * 
	 * Uses `useEffect()` under the hood.
	 */
	onMount: AsyncAllowedEffectCallback = () => noOp;

	/**
	 * Stores the object returned by {@link beforeRender}.
	 * @see {@link templateContext}
	 */
	declare private _templateContext: ReturnType<this['beforeRender']>;

	/**
	 * Exposes the object returned by {@link beforeRender}.
	 * 
	 * This is useful when you need to render some state or props
	 * in a transformed format. Put the transformation logic
	 * in {@link beforeRender} to the keep the main
	 * function component body clean.
	 * 
	 * ******
	 * 
	 * @example <caption>Using `templateContext`.</caption>
	 * 
	 * ```tsx
	 * class MyComponentLogic extends ComponentInstance {
	 *     beforeRender = () => {
	 *         const title = `My Site | ${this.props.title}`;
	 *         return { title };
	 *     }
	 * }
	 * const MyComponent = (props) => {
	 *     const self = useInstance(MyComponentLogic, props);
	 *     const { templateContext: ctx, state } = self;
	 * 
	 *     return (
	 *         <h1>
	 *             {ctx.title}
	 *         </h1>
	 *         <p>{props.description}</p>
	 *     );
	 * }
	 * ```
	 */
	get templateContext() {
		return this._templateContext;
	}

	/**
	 * Runs _before_ every render cycle, including the first.
	 * Useful for logic that is involved in determining what to render.
	 * 
	 * It runs in the same way as logic placed directly into the
	 * function component body preceding the return statement.
	 * 
	 * This is the ideal place to transform data for display.
	 * Return the transformed data in an object, and the object will
	 * availble as [`self.templateContext`]({@link templateContext})
	 * for use in your JSX template.
	 * 
	 * PS: You can conditionally update state from here, but with certain caveats.
	 * {@link https://react.dev/reference/react/useState#storing-information-from-previous-renders | See the React docs for details}.
	 */
	beforeRender: () => object | void = () => {};

	/**
	 * Runs **_after_** every render cycle, including the first.
	 * 
	 * Should usually only be used for logic that does not directly take part in determining what to render,
	 * like logging and analytics.
	 * 
	 * Uses `useEffect()` under the hood.
	 * 
	 * @returns A cleanup function.
	 */
	onRender: AsyncAllowedEffectCallback = () => noOp;

	/**
	 * Runs when the component is unmounted.
	 * It is called _after_ the cleanup function returned by onMount.
	 */
	cleanUp: IVoidFunction = () => {};
};

/**
 * Enables full separation of concerns between a React component's template
 * and all of the logic that drives it.
 * 
 * Returns an object that fully represents a logical instance
 * of the rendered React component, with the exception of the JSX template itself.
 * 
 * This means that all of your component's logic and lifecycle handlers
 * can be externalized from the function component itself,
 * and defined in a separate class. 
 * 
 * The provided class should be a subclass of {@link ComponentInstance}.
 */
export const useInstance: UseInstance = (...args: UIParams): UIReturn => {
	const [Component, props = {}] = args;

	// useHooks.
	const instance = useLogic(Component, props);

	// beforeMount, onMount, cleanUp.
	useMountCallbacks(instance);

	// beforeRender.
	/**
	 * A proxy variable to allow typechecking of the assignment
	 * to `self.templateContext` despite the need for "readonly" error suppression.
	 */
	let _templateContextProxy_: ReturnType<typeof instance.beforeRender>;

	// @ts-expect-error Assigning to a readonly property.
	instance._templateContext = (
		_templateContextProxy_ = instance.beforeRender?.()
	);

	// onRender.
	useEffect(() => {
		const cleanupAfterRerender = instance.onRender?.();

		return () => {
			if (typeof cleanupAfterRerender === 'function') cleanupAfterRerender();
			else cleanupAfterRerender?.then((cleanUp?: FunctionType) => cleanUp?.());
		};
	});

	return instance;
};


/** /
testing: {
	class A extends ComponentInstance<EmptyObject> {
		getInitialState = (p?: object) => ({putan: ''});
		// k = this.props.o
		am = this.state['_initialValues_'];
		k = this.am.putan;

		beforeRender = () => ({g: ''});

		useHooks = () => {
			return {j: 9};
		};
	}

	const a = useInstance(A, {});
	a.am;

	// a.props['o'];
	type bbbb = A['state'];
	type ttt = bbbb['put'];
}
/**/
