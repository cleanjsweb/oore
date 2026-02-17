import { ClassComponent, ComponentLogic } from '@/classy';
import type { ReactElement, ReactNode, JSXElementConstructor, FunctionComponent } from 'react';
import type React from 'react';


export type TComponent = JSXElementConstructor<any>;

export type TSlotName = keyof any;
export type TSlotAlias = keyof any;

/**
 * A map of slot aliases to actual {@link SlotComponent}s.
 * 
 * The `useSlots` hook will create a corresponding key for
 * each alias in this record to hold any `ReactNode`s rendered for that slot.
 */
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

/**
 * A child component used to insert content into a specific slot in the parent component.
 * This can either be a string, or a React component with a `slotName` property.
 * If `slotName` is missing `displayName` will be used as a fallback.
 * 
 * ### Strings
 * For strings, they are treated by React a native tags. This lets you use custom strings
 * as if you are rendering a custom Web Component, or simply handle specific HTML tags in a specific way.
 * 
 * If using a custom string, you will want to handle it in the parent component by simply forwarding the slot's
 * props to an actual element of your choice.
 * 
 * So consumers may pass the following as `children`.
 * ```jsx
 * <option-slot>Click</option-slot>
 * ```
 * and you can map that to
 * ```jsx
 * <button
 *     {...slotNodes.Option.props}
 *     type="button"
 * />
 * ```
 * 
 * ### React Components
 * For slot components that are actual React components, the parent can simply
 * render the slot node directly. 
 * 
 * So consumers may pass the following as `children`.
 * ```jsx
 * <Parent.slots.Content>
 *     Some awesome content.
 * </Parent.slots.Content>
 * ```
 * and you can map that to
 * ```jsx
 * return <>
 *     <h1>Title</h1>
 *     {slotNodes.Content}
 *     <footer>Powered by oore</footer>
 * </>
 * ```
 * 
 * This means `Parent.slots.Content` must be defined as a proper React component
 * and is solely responsible for doing something with the `"Some awesome content."`
 * which was passed into it as children.
 * 
 * This is unlike the string version where the parent component
 * extracts the props passed to the slot and handles
 * what the slot actually renders.
 */
export type SlotComponent<TComponentArg extends TComponent = TComponent> = (
	SlotNamedComponent<TComponentArg> 
	| DisplayNamedComponent<TComponentArg>
) & { isRequiredSlot?: boolean };

/**
 * A parent component which accepts content that can be grouped into predefined slots.
 * By convention, it should have a `slots` property which is a {@link TSlotsRecord}.
 * 
 * This allows consumers access the predefined slot components
 * directly from the parent component itself,
 * through an alias that is easy to remember.
 */
export type SlottedReactComponent<
	TComponentArg extends TComponent = TComponent,
	TSlotAliasArg extends TSlotAlias = TSlotAlias, 
	TSlotsRecordArg extends TSlotsRecord<TSlotAliasArg> = TSlotsRecord<TSlotAliasArg>
> = TComponentArg & {
	slots: TSlotsRecordArg;
	// Slots: TSlotsRecordArg;
	requiredSlotAliases?: TSlotAliasArg[];
};


/**
 * A record of slot aliases mapped to the corresponding `ReactNode`(s)
 * to be rendered for that slot.
 */
export type TSlotNodes<TSlotAliasArg extends TSlotAlias> = {
	[Key in TSlotAliasArg]?: Array<ReactElement<any>>;
};

export type TUseSlotsResult<TSlotAliasArg extends TSlotAlias = TSlotAlias> = Readonly<[
	/**
	 * A record of slot aliases to their corresponding React nodes.
	 * Each alias maps to an array of one or more React nodes that were passed
	 * as children for that slot.
	 * 
	 * If a slot was not rendered in `children`, it's alias will be `undefined` in this object.
	 */
	slotNodes: TSlotNodes<TSlotAliasArg>,
	/**
	 * Valid React nodes passed as children which did not match any of the
	 * predefined slots.
	 */
	unmatchedChildren: ReactNode[],
	/**
	 * Items included in `children` which are not valid React nodes.
	 */
	invalidChildren: any[],
]>;

export interface IUseSlots {
	<TSlotAliasArg extends TSlotAlias = TSlotAlias>(
		/**
		 * Your component's `children` prop.
		 * The nodes it contains will be categorized and
		 * grouped according to the predefined {@link slotComponents}.
		 */
		children: ReactNode,
		self: SlottedReactComponent,
	): TUseSlotsResult<TSlotAliasArg>;
}

export type PotentialSlotComponent = string | SlotComponent | TComponent;
