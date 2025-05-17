import type { TCleanState } from '@/base/state';
import type { ULParams, ULReturn, UseLogic } from './types/hook';

import { useMemo, useRef } from 'react';
import { useCleanState } from '@/base/state';


/**
 * The base type for the `props` type argument.
 * 
 * This is not the type of the `props` property itself.
 * It merely defines the type constraint for the type argument
 * passed when extending any of the logic classes.
 * 
 * It accepts null for components that don't take any props.
 */
export type TPropsBase = NonPrimitive | null;



/**
 * Base class for a class that holds methods to be used in a function component.
 * 
 * These methods will always have access to the latest copy of
 * the component's state and props via `this.state` and `this.props` respectively.
 * 
 * The special {@link Class['useHooks'] | useHooks} method allows you to consume
 * React hooks within this class.
 * 
 * Call the {@link useLogic} hook inside your function component to instantiate the class.
 * 
 * @typeParam TProps - {@include ./types/tprops.md}
 */
export class ComponentLogic<TProps extends TPropsBase = null> {
	/**
	 * A {@link TCleanState | `CleanState`} object.
	 * Holds all of your component's state,
	 * and methods for conveniently manipulating those values.
	 * Initialiazed with the object returned from your `getInitialState` method.
	 */
	declare readonly state: TCleanState<ReturnType<this['getInitialState']>>;

	/** The props passed into your component at the time of rendering. */
	declare readonly props: TProps extends null ? EmptyObject : TProps;

	/**
	 * Values received from the hooks your component consumes.
	 * This holds the latest copy of the object returned by
	 * {@link useHooks}.
	 * 
	 * You should not mutate this object directly.
	 * `useHooks` is called on every render and the object it returns
	 * will completely overwrite whatever the previous value of `this.hooks` was.
	 * `this.hooks` should only be updated through the object returned from `useHooks`.
	 * 
	 * If you need to update a value from outside `useHooks` as well, then consider
	 * wrapping it with {@link React.useRef}, since React refs are persisted across rerenders.
	 */
	declare readonly hooks: ReturnType<this['useHooks']>;

	/**
	 * Called before each instance of your component is mounted.
	 * It receives the initial `props` object and should return
	 * an object with the initial values for your component's state.
	 */
	getInitialState = (props?: TProps extends null ? undefined : TProps): object => ({});

	/**
	 * Call React hooks from here. If your component needs
	 * access to values return from the hooks you call,
	 * expose those values by returning an object with said values.
	 * 
	 * The returned object will be accessible as {@link hooks | `this.hooks`} within
	 * your component class.
	 */
	useHooks = (): object | void => {};

	/**
	 * Persist class members during HMR. {@include ./hrm-preserve-keys.md}
	 * @privateRemarks
	 * @see {@link https://cleanjsweb.github.io/neat-react/classes/API.BaseClasses.ComponentLogic.html#_hmrpreservekeys | Full details}
	 */
	_hmrPreserveKeys: Array<keyof this | (string & {})> = [];

	/**
	 * Run custom logic after HMR update. {@include ./on-hrm-update.md}
	 * @privateRemarks
	 * @see {@link https://cleanjsweb.github.io/neat-react/classes/API.BaseClasses.ComponentLogic.html#_onhmrupdate | Full details}
	 */
	declare _onHmrUpdate?: <
		TInstance extends this
	>(oldInstance: TInstance) => void;
};


/**
 * Returns an instance of the provided class, which holds methods for your component and
 * encapsulates hook calls with the special {@link ComponentLogic.useHooks | `useHooks`} method.
 * 
 * The class argument must be a subclass of {@link ComponentLogic}.
 * 
 * @see https://cleanjsweb.github.io/neat-react/functions/API.useLogic.html
 */
export const useLogic: UseLogic = (...args: ULParams): ULReturn => {
	const [Logic, props = {}] = args;

	// In production, we only use the latestInstance the first time, and it's ignored every other time.
	// This means changing the class at runtime will have no effect in production.
	// latestInstance is only extracted into a separate variable for use in dev mode during HMR.
	const latestInstance = useMemo(() => new Logic(), [Logic]);
	// const latestInstance = useMemo(() => new Logic(), []);
	const instanceRef = useRef(latestInstance);

	const refreshState = () => {
		// @ts-expect-error
		instanceRef.current.props = props;
		// @ts-expect-error
		instanceRef.current.state = useCleanState(instanceRef.current.getInitialState, props);
		// @ts-expect-error
		instanceRef.current.hooks = instanceRef.current.useHooks() ?? {};
	};

	if (process.env.NODE_ENV === 'development' && instanceRef.current !== latestInstance) {
		const oldInstance = instanceRef.current;

		latestInstance._hmrPreserveKeys.forEach((_key) => {
			const key = _key as keyof typeof latestInstance;
			// @ts-expect-error We're assigning to readonly properties. Also, Typescript doesn't know that the type of the left and right side will always match, due to the dynamic access.
			latestInstance[key] = oldInstance[key];
		});

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

	return instanceRef.current;;
};


/** /
testing: {
	const a: object = {b: ''};

	type t = keyof typeof a;

	class MyComponentLogic extends ComponentLogic<{}> {
		getInitialState = () => ({b: 7});
		b = () => 8 + this.state.b;

		useHooks = () => ({a: 'undefined'});
	};

	type tt = keyof {};

	const self = useLogic(MyComponentLogic);
	self.hooks;
	self.useHooks();


	const A = class C extends ComponentLogic {
		getInitialState = () => ({a: 'l'});
		a = () => this.state.a = '';
	}

	// const oa = {['a' as unknown as symbol]: 'boo'};
	const oa = {['a']: 'boo'};
	useLogic(A, oa);
}
/**/
