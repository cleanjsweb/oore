import type { ReactElement, ReactNode, ReactPortal } from 'react';
import type { ComponentProps, IUseSlots, PotentialSlotComponent, SlotComponent, TSlotName, TSlotNode, TSlotNodes, TUseSlotsResult, TypedNode } from './types';

import { throwDevError } from '@/helpers/errors';
import React, { useMemo } from 'react';
import { canIndex } from '@/helpers';


export const isElementChild = (child: ReactNode): child is ReactElement<any, any> => {
	if (child && typeof child === 'object' && 'type' in child) {
		return true;
	}
	return false;
};


interface IGetSlotName {
	(TargetComponent: PotentialSlotComponent, child?: ReactElement): string | undefined;
}

export const getComponentSlotName: IGetSlotName = (TargetComponent, child) => {
	if (child) {
		const keyTypes = ['string', 'number', 'symbol'];
		const slotName = child.props['data-slot-name'];

		if (keyTypes.includes(typeof slotName)) {
			return slotName;
		}
	}

	if (typeof TargetComponent === 'string') {
		return TargetComponent;
	} else if ('slotName' in TargetComponent) {
		return TargetComponent.slotName;
	} else if ('displayName' in TargetComponent) {
		return TargetComponent.displayName;
	}

	return undefined;
};

export const isPortalChild = (child: ReactNode): child is ReactPortal => {
	return (
		!!child
		&& typeof child === 'object'
		&& 'children' in child
	);
};

/**
 * Groups `children` prop into predefined slots.
 * 
 * @returns A {@link TUseSlotsResult} array,
 * which includes a `slotNodes` object that maps the keys from
 * the predefined {@link Caller.slots} object to the corresponding
 * React node(s) that were rendered for that slot.
 * 
 * @see {@link SlotComponent} for more on how to use the returned slot nodes.
 */
export const useSlots: IUseSlots = (children, Caller) => {
	type TSlotsRecordArg = typeof Caller.Slots;
	type TSlotAliasArg = keyof TSlotsRecordArg;
	type TSlotComponentArg = valueof<TSlotsRecordArg>;

	type TLocalSlotNodes = TSlotNodes<typeof Caller>;

	const slotsAliasLookup = useMemo(() => {
		type TEntries = Array<[TSlotAliasArg, TSlotComponentArg]>;
		type TLookup = Record<TSlotName, TSlotAliasArg>;

		const entries = Object.entries(Caller.Slots) as TEntries;
		const aliasLookup = {} as TLookup;

		entries.forEach(([alias, RegisteredSlotComponent]) => {
			const slotName = getComponentSlotName(RegisteredSlotComponent);
			if (!slotName) {
				throwDevError(`A registered slot component did not have a slot name. All components registered as slots must either be a string tag-name or a React component with either "slotName" or "displayName". The affected component was: ${RegisteredSlotComponent}`);
				return;
			}
			aliasLookup[slotName] = alias;
		});

		return aliasLookup;
	}, [Caller.Slots]);

	// @todo Expose original source order of `children` with respect to slot aliases.
	const result = useMemo(() => {
		const slotNodes: TLocalSlotNodes = {};
		const unmatchedChildren: ReactNode[] = [];
		const invalidChildren: any[] = [];
		const requiredSlotAliases = [
			...(Caller.requiredSlotAliases ?? [])
		];

		React.Children.forEach(children, (_child) => {
			const child = _child as TSlotNode<typeof Caller>;

			if (!child) {
				invalidChildren.push(child);
				return;
			}

			if (!React.isValidElement(child)) {
				console.warn(`Invalid node found in JSX children while parsing slots. Got: "${child}".`);
				invalidChildren.push(child);
				return;
			};

			// @todo Check for fragment

			if (!isElementChild(child)) {
				unmatchedChildren.push(child);
				return;
			}

			const slotAlias: keyof TLocalSlotNodes | null = (() => {
				const slotName = getComponentSlotName(child.type, child);

				return slotName ? slotsAliasLookup[slotName] ?? null : null;
			})();

			if (slotAlias) {
				if (typeof Caller.Slots[slotAlias] !== 'string') {
					if (Caller.Slots[slotAlias]?.isRequiredSlot) {
						requiredSlotAliases.push(slotAlias);
					}
				}
				if (slotNodes[slotAlias]) {
					slotNodes[slotAlias].push(child);
				} else {
					slotNodes[slotAlias] = [child];
				}
			}
			else unmatchedChildren.push(child);
		});

		requiredSlotAliases.forEach((slotAlias) => {
			if (!slotNodes[slotAlias]) {
				throwDevError(`Missing required slot "${String(slotAlias)}".`);
			}
		});

		return [slotNodes, unmatchedChildren, invalidChildren] as const;
	}, [children]);

	return result;
};

export type {
	WithSlotsConfig, WithSlotsConfig as SlottedComponent,
	TSlotsRecord, SlotComponent, PotentialSlotComponent,
} from './types';
