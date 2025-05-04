
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { ICleanStateClass, ICleanStateConstructor, PutManyPayload, PutState } from './class-types';

/** @internal */
export class CleanStateBase<TState extends Record<string, any>> {
	readonly reservedKeys: string[];
	readonly valueKeys: string[];

	private _values_: Record<string, any> = {} as TState;
	private _initialValues_: TState;
	private _setters_ = {} as {
		[Key in keyof TState]: PutState<TState>[Key];
	};

	constructor(initialState: TState) {
		this.reservedKeys = Object.keys(this);

		/**
		 * The keys from the initial state object.
		 * By capturing and storing the value once, we ensure that any potential changes to the object,
		 * or irregularities in the order of keys returned by Object.keys,
		 * will not affect the order of subsequent useState calls.
		 * Only keys provided on the initial call will be recognized,
		 * since CleanState is instantiated only once with useMemo,
		 * and they will always be processed in a consistent order during rerenders.
		 */
		this.valueKeys = Object.keys(initialState);
		this._initialValues_ = { ...initialState };

		this.valueKeys.forEach((key) => {
			if (this.reservedKeys.includes(key)) throw new Error(`The name "${key}" is reserved by CleanState and cannot be used to index state variables. Please use a different key.`);

			const self = this;
			Object.defineProperty(this, key, {
				get() {
					return self._values_[key];
				},
				set(value) {
					self._setters_[key as keyof TState](value);
				},
				enumerable: true,
			});
		});
	}

	static update = function update<TState extends object>(this: CleanStateBase<TState>) {
		if (!(this instanceof CleanState)) throw new Error('CleanState.update must be called with `this` value set to a CleanState instance. Did you forget to use `.call` or `.apply`? Example: CleanState.update.call(cleanState);');

		/**
		 * Linters complain about the use of a React hook within a loop because:
		 * > By following this rule, you ensure that Hooks are called in the same order each time a component renders.
		 * > That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls. 
		 * To resolve this, we're calling `useState` via an alias `retrieveState`.
		 * Bypassing this rule is safe here because `useCleanState` is a special case,
		 * and it guarantees that the same useState calls will be made on every render in the exact same order.
		 * Therefore, it is safe to silence the linters, and required for this implementation to work smoothly.
		 */
		const retrieveState = useState;

		this.valueKeys.forEach((key) => {
			// @todo Make state updates accessible immediately. Use state.staged to access the scheduled updates.
			let setter: Dispatch<SetStateAction<any>>;

			[this._values_[key], setter] = retrieveState(this.initialState[key as keyof TState]);

			this._setters_[key as keyof TState] = ((valueOrCallback) => {
				// this._staged_[key] = value;
				setter(valueOrCallback);
			});
		});
	};

	get put(): PutState<TState> {
		return { ...this._setters_ };
	}
	get initialState() {
		return { ...this._initialValues_ };
	}

	// readonly putMany = (newValues: Partial<TState>) => {
	readonly putMany = (newValues: PutManyPayload<TState>) => {
		type StateKey = keyof TState;
		type StateValue = TState[StateKey];
		type Entry = [StateKey, StateValue];

		Object.entries(newValues).forEach((entry) => {
			const [key, value] = entry as Entry;
			this.put[key](value);
		});
	};
};

/** @internal */
export const CleanState = (
	CleanStateBase
) as unknown as (ICleanStateConstructor & ICleanStateClass);
