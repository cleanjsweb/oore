import { CleanStateBase } from './class';
import { TCleanState, TStateData } from './hook-types';

export type TCleanStateBase = typeof CleanStateBase;
export type TCleanStateBaseKeys = keyof TCleanStateBase;

export type PutState<TState extends TStateData> = {
	[Key in keyof TState]: React.Dispatch<React.SetStateAction<TState[Key]>>;
}

export type PutManyPayload<TState extends TStateData> = {
	[Key in keyof TState]?: React.SetStateAction<TState[Key]>;
}

export type StateFragment<
	TComponent extends { getInitialState: (...args: any[]) => TStateData }
> = PutManyPayload<ReturnType<TComponent['getInitialState']>>;

export type { StateFragment as SF };


export interface ICleanStateConstructor {
	new <TState extends object>(
		...args: ConstructorParameters<typeof CleanStateBase>
	): TCleanState<TState>;
}

export type ICleanStateClass = ICleanStateConstructor & {
	[Key in TCleanStateBaseKeys]: (typeof CleanStateBase)[Key];
}
