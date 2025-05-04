/**
 * @module ComponentMethods
 */


// JSDoc references
import { useRerender } from '@/helpers';
import type { useCleanState } from './state';

// Types
import type { TCleanState, TStateData } from './state';

// Values
import { useEffect, useMemo, useRef } from 'react';


/**
 * @summary
 * Base class for a class that holds methods for a function component.
 * 
 * @remarks
 * These methods will have access to the components state and props via
 * `this.state` and `this.props` respectively.
 * 
 * Call the {@link useMethods} hook inside your function component to instantiate the class.
 */
export class ComponentMethods<
		TProps extends object = {},
		TState extends TStateData | null = null> {
	declare readonly props: TProps;
	declare readonly state: TState extends TStateData ? TCleanState<TState> : null;

	/**
	 * Persist class members during HMR. {@include ../classy/logic/hrm-preserve-keys.md}
	 * @privateRemarks
	 * @see {@link https://cleanjsweb.github.io/neat-react/classes/API.BaseClasses.ComponentMethods.html#_hmrpreservekeys | Full details}
	 */
	_hmrPreserveKeys: Array<keyof this | (string & {})> = []; // @todo Keep undefined. Update to empty array after instantiation in dev env.

	/**
	 * Run custom logic after HMR update. {@include ../classy/logic/on-hrm-update.md}
	 * @privateRemarks
	 * @see {@link https://cleanjsweb.github.io/neat-react/classes/API.BaseClasses.ComponentMethods.html#_onhmrupdate | Full details}
	 */
	declare _onHmrUpdate?: <
		TInstance extends this
	>(oldInstance: TInstance) => void;
};

type UseMethods = {
	<Class extends typeof ComponentMethods<object, object>>(
		Methods: Class & Constructor<InstanceType<Class>>,
		props: InstanceType<Class>['props'],
		state: InstanceType<Class>['state'],
	): InstanceType<Class>;

	<Class extends typeof ComponentMethods<object, null>>(
		Methods: Class & Constructor<InstanceType<Class>>,
		props: InstanceType<Class>['props'],
		state?: null // null should be equal to InstanceType<Class>['state'] in this case.
	): InstanceType<Class>;

	<Class extends typeof ComponentMethods<NeverObject, null>>(
		Methods: Class & Constructor<InstanceType<Class>>,
	): InstanceType<Class>;
}

type UMParams = [
	Methods: (
		typeof ComponentMethods<object, object>
		& Constructor<ComponentMethods<object, object>>
	),
	props?: object,
	state?: TCleanState<object> | null
]

type UMReturn = ComponentMethods<object, object>;


/**
 * Returns an instance of the provided class,
 * with the state and props arguments added as instance members.
 * 
 * `state` should be an instance of `CleanState` created with {@link useCleanState}.
 */
const useMethods: UseMethods = (...args: UMParams): UMReturn => {
	const [Methods, props = {}, state] = args;

	// Vite HMR seems to sometimes reinitialize useMemo calls after a hot update,
	// causing the instance to be unexpectedly recreated in the middle of the component's lifecycle.
	// But useRef and useState values appear to always be preserved whenever this happens.
	// So those two are the only cross-render-persistence methods we can consider safe.

	// In production, we only use the latestInstance the first time, and it's ignored every other time.
	// This means changing the class at runtime will have no effect in production.
	// latestInstance is only extracted into a separate variable for use in dev mode during HMR.
	const latestInstance = useMemo(() => new Methods(), [Methods]);
	const instanceRef = useRef(latestInstance);

	const refreshState = () => {
		// @ts-expect-error
		instanceRef.current.props = props;
	
		// @ts-expect-error
		if (state) instanceRef.current.state = state;
	}

	if (process.env.NODE_ENV === 'development' && instanceRef.current !== latestInstance) {
		const oldInstance = instanceRef.current;

		latestInstance._hmrPreserveKeys.forEach((_key) => {
			const key = _key as (typeof latestInstance._hmrPreserveKeys)[number];
			// @ts-expect-error We're assigning to readonly properties. Also, Typescript doesn't know that the type of the left and right side will always match, due to the dynamic access.
			latestInstance[key] = oldInstance[key];
		});

		// Ensure that any stale references to oldInstance within the app
		// will end up retrieving up-to-date values from latestInstance
		// through the prototype chain.
		Reflect.ownKeys(oldInstance).forEach((_key) => {
			const key = _key as keyof typeof oldInstance;
			delete oldInstance[key];
		});
		Object.setPrototypeOf(oldInstance, latestInstance);

		instanceRef.current = latestInstance;
		refreshState();
		latestInstance._onHmrUpdate?.(oldInstance);
	}

	else refreshState();

	return instanceRef.current;
};

export  { useMethods };

/** /type_testing: {
	let a = async () => { 
		const a: object = {b: ''};

		type t = keyof typeof a;

		class MyMethods extends ComponentMethods<EmptyObject, null> {
			// static getInitialState = () => ({});
		};

		const { useCleanState } = (await import('./state.js'));

		const self = useMethods(MyMethods, {});
		self.state;
	}
}/**/

