import { CleanStateBase } from './class';


/**
 * Base type for an `initialState` object.
 * It is a regular object type, with some reserved keys excluded.
 */
export type TStateData = object & {
	[Key in keyof CleanStateBase<{}>]?: never;
};

/**
 * Describes a `CleanState` object instantiated with an `initialState`
 * object of type `TState`.
 * 
 * @typeParam TState - The type of your `initialState` object.
 */
export type TCleanState<TState extends TStateData> = (
	CleanStateBase<TState>
	& Omit<TState, keyof CleanStateBase<{}>>
);

/**
 * Takes a `TCleanState` type and returns the `initialState` type
 * associated with the provided `TCleanState`.
 * 
 * This is useful to isolate the type of your actual state data without
 * any of the reserved keys provided by the Clean State utility.
 */
export type ExtractCleanStateData<
	YourCleanState extends CleanStateBase<{}>
> = Omit<YourCleanState, keyof CleanStateBase<{}>>;

type StateInitFunction = (...args: any[]) => object;
type StateInit = object | StateInitFunction;

export type TInitialState<
	Initializer extends StateInit
> = Initializer extends (...args: any[]) => (infer TState extends object)
	? TState
	: Initializer;


/**
 * @typeParam TInit - An initial state object, or a function that
 * returns the initial state object.
 */
export type TUseCleanState = <TInit extends StateInit>(
	_initialState: TInit,
	...props: TInit extends (...args: infer TProps extends any[]) => (infer TState extends object)
		? TProps
		: []
) => TCleanState<TInitialState<TInit>>;
