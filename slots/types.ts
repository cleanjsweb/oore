import type { ReactElement, ReactNode, JSXElementConstructor, FunctionComponent } from 'react';
import type React from 'react';


export type TComponent = JSXElementConstructor<any>;

export type TSlotName = keyof any;
export type TSlotAlias = keyof any;

export type TSlotsRecord<TKey extends TSlotAlias = TSlotAlias> = {
	[Key in TKey]: (string | SlotComponent);
};

export interface DisplayNamedComponent<
	TProps extends any = any
> extends FunctionComponent<TProps> { displayName: string };

export interface SlotNamedComponent<TProps extends any = any, TSlotNameArg extends TSlotName = TSlotName> {
	(props: TProps): ReactNode;
	slotName: TSlotNameArg;
};

export type SlotComponent<
	Component extends TComponent = TComponent
> = SlotNamedComponent | DisplayNamedComponent<Component>;

export type SlottedComponent<
	TComponentArg extends (props: unknown) => ReactNode,
	TSlotAliasArg extends TSlotAlias = TSlotAlias, 
	TSlotsRecordArg extends TSlotsRecord<TSlotAliasArg> = TSlotsRecord<TSlotAliasArg>
> = TComponentArg & { Slots: TSlotsRecordArg };

export type TSlotNodes<TSlotAliasArg extends TSlotAlias> = {
	[Key in TSlotAliasArg]?: ReactElement<any>;
};

export type TUseSlotsResult<TSlotAliasArg extends TSlotAlias = TSlotAlias> = Readonly<[
	slots: TSlotNodes<TSlotAliasArg>,
	unmatchedChildren: ReactNode[],
	invalidChildren: any[],
]>;

export interface IUseSlots {
	<TSlotAliasArg extends TSlotAlias = TSlotAlias>(
		children: ReactNode,
		slotComponents: TSlotsRecord<TSlotAliasArg>,
	): TUseSlotsResult<TSlotAliasArg>;
}

export type PotentialSlotComponent = string | SlotComponent | TComponent;
