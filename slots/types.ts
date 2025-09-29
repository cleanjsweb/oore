import type { ReactElement, ReactNode, JSXElementConstructor, FunctionComponent } from 'react';
import type React from 'react';


export type TComponent = JSXElementConstructor<any>;

export type TSlotName = keyof any;
export type TSlotAlias = keyof any;

export type TSlotsRecord<TKey extends TSlotAlias = TSlotAlias> = {
	[Key in TKey]: string | SlotComponent;
};

export type DisplayNamedComponent<
	TComponentArg extends TComponent = TComponent,
	TDisplayNameArg extends string = string
> = TComponentArg & { displayName: TDisplayNameArg };

export type SlotNamedComponent<
	TComponentArg extends TComponent = TComponent,
	TSlotNameArg extends TSlotName = TSlotName
> = TComponentArg & { slotName: TSlotNameArg };

export type SlotComponent<TComponentArg extends TComponent = TComponent> = (
	SlotNamedComponent<TComponentArg> 
	| DisplayNamedComponent<TComponentArg>
) & { isRequiredSlot?: boolean };

export type SlottedComponent<
	TComponentArg extends TComponent = TComponent,
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
		requiredSlots?: TSlotAliasArg[],
	): TUseSlotsResult<TSlotAliasArg>;
}

export type PotentialSlotComponent = string | SlotComponent | TComponent;
