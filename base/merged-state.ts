import '../globals';

import { useMemo, useRef, useState } from 'react';

class MergedState<TState extends object> {
	static useRefresh<TState extends object>(this: MergedState<TState>) {
		[this._values_, this.setState] = useState(this.initialState);
	}

	reservedKeys: string[];
	valueKeys: string[];

	private _initialValues_  = {} as TState;
	private _values_ = {} as TState;

	declare private setState: (value: TState) => void;
	private _setters_ = {} as {
		[Key in keyof TState]: (value: TState[Key]) => void;
	};

	get put() {
		return { ...this._setters_ };
	}
	get initialState() {
		return { ...this._initialValues_ };
	}

	constructor(initialState: TState) {
		this.reservedKeys = Object.keys(this);
		this.valueKeys = [];

		this._initialValues_ = { ...initialState };
		this._values_ = { ...initialState };

		Object.keys(initialState).forEach((_key) => {
			const key = _key as Extract<keyof TState, string>;

			if (this.reservedKeys.includes(key)) {
				throw new Error(`The name "${key}" is reserved by CleanState and cannot be used to index state variables. Please use a different key.`);
			}

			this.valueKeys.push(key);

			this._setters_[key] = (value: TState[keyof TState]) => {
				// this._values_[key] = value;
				this.setState({
					...this._values_,
					[key]: value,
				});
			};

			const self = this;
			Object.defineProperty(this, key, {
				get() {
					return self._values_[key];
				},
				set(value) {
					self._setters_[key](value);
				},
				enumerable: true,
			});
		});
	}

	putMany = (newValues: Partial<TState>) => {
		this.setState({
			...this._values_,
			...newValues,
		});
	};
}

/**
 * Similar to {@link useCleanState},
 * but uses a single `useState` call for the entire object.
 */
export const useMergedState = <TState extends object>(initialState: TState) => {
	const cleanState = useRef(
		useMemo(() => {
			return new MergedState(initialState);
		}, []) as MergedState<TState> & TState
	).current;

	MergedState.useRefresh.call(cleanState);
	return cleanState;
};
