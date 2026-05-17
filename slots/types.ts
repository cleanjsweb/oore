import type { ReactElement, ReactNode, ComponentType, ReactPortal } from 'react';


type JSXTagLike = string | keyof JSX.IntrinsicElements | ComponentType<any>;

/** This fixes overly narrow T type used by React's ComponentProps type. */
export type ComponentProps<T extends JSXTagLike> = (
	T extends ComponentType<infer P>
		? P
		: T extends keyof JSX.IntrinsicElements
			? JSX.IntrinsicElements[T]
			: {}
);

export type TSlotName = keyof any;
export type TSlotAlias = keyof any;

/**
 * A map of slot aliases to actual {@link SlotComponent}s.
 * 
 * The `useSlots` hook will create a corresponding key for
 * each alias in this record to hold any `ReactNode`s rendered for that slot.
 */
export type TSlotsRecord<TKey extends TSlotAlias = TSlotAlias> = {
	[Key in TKey]: SlotComponent<string | ComponentType<any>>;
};

export type DisplayNamedComponent<
	TComponent extends ComponentType<any> = ComponentType<any>,
	TName extends string = string
> = TComponent & { displayName: TName };


interface ISlotConfig<TName> {
	slotName: TName,
	/**
	 * @deprecated The SlottedComponent should be responsible for indicating which slots it requires.
	 * Individual slot components may be reused by multiple slotted components with varying requirements.
	 */
	isRequiredSlot?: boolean,
}

/**
 * A child component used to insert content into a specific slot in the parent component.
 * This can either be a string, or a React component with a `slotName` property.
 * 
 * > `displayName` is no longer supported as a fallback for `slotName`.
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
 *     {...slotNodes.Option[0].props}
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
 * <Parent.Slots.Content>
 *     Some awesome content.
 * </Parent.Slots.Content>
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
 * This means `Parent.Slots.Content` must be defined as a proper React component
 * and is solely responsible for doing something with the `"Some awesome content."`
 * which was passed into it as children.
 * 
 * This is unlike the string version where the parent component
 * extracts the props passed to the slot and handles
 * what the slot actually renders.
 */
export type SlotComponent<
	TComponent extends JSXTagLike = ComponentType<any>,
	TName extends TSlotName = TSlotName
> = (
	TComponent extends string
		? TComponent
		: TComponent & ISlotConfig<TName>
);


/**
 * A parent component which accepts content that can be grouped into predefined slots.
 * By convention, it should have a `slots` property which is a {@link TSlotsRecord}.
 * 
 * This allows consumers access the predefined slot components
 * directly from the parent component itself,
 * through an alias that is easy to remember.
 */
export type SlottedComponent<
	TOwner extends object = ComponentType<any>,
	TSlots extends TSlotsRecord = TSlotsRecord
> = TOwner & {
	Slots: TSlots;
	requiredSlotAliases?: Array<keyof TSlots>;
};


export type TypedNode<P, T extends JSXTagLike> = (
	ReactElement<P, T> | (
		ReactElement<P, T> & ReactPortal
	)
);

export type TSlotNode<
		TSlotted extends SlottedComponent,
		Key extends keyof TSlotted['Slots'] = keyof TSlotted['Slots']> = (
	TypedNode<
		ComponentProps<TSlotted['Slots'][Key]>,
		TSlotted['Slots'][Key]
	>
);

/**
 * A record of slot aliases mapped to the corresponding `ReactNode`(s)
 * to be rendered for that slot.
 */
export type TSlotNodes<TSlotted extends SlottedComponent> = {
	[Key in keyof TSlotted['Slots']]?: Array<TSlotNode<TSlotted, Key>>;
};

export type TUseSlotsResult<TSlotted extends SlottedComponent> = Readonly<[
	/**
	 * A record of slot aliases to their corresponding React nodes.
	 * Each alias maps to an array of one or more React nodes that were passed
	 * as children for that slot.
	 * 
	 * If a slot was not rendered in `children`, it's alias will be `undefined` in this object.
	 */
	slotNodes: TSlotNodes<TSlotted>,
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
	<TSlotted extends SlottedComponent>(
		/**
		 * Your component's `children` prop.
		 * The nodes it contains will be categorized and
		 * grouped according to the predefined {@link slotComponents}.
		 */
		children: ReactNode,
		Caller: TSlotted,
	): TUseSlotsResult<TSlotted>;
}

export type PotentialSlotComponent = string | SlotComponent | ComponentType<any>;
