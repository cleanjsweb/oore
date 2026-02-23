import type { ReactElement, ReactNode } from 'react';
import type { IUseSlots, PotentialSlotComponent, SlotComponent, TSlotName, TSlotNodes, TUseSlotsResult } from './types';

import { throwDevError } from '@/helpers/errors';
import React, { useMemo } from 'react';


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
			if (typeof child.type === 'string') {
				child.props.tagName = child.type;
			}
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
	type TSlotsRecordArg = typeof Caller.slots;
	type TSlotAliasArg = keyof TSlotsRecordArg;
	type TSlotComponentArg = valueof<TSlotsRecordArg>;

	type TSlotNodesArg = TSlotNodes<TSlotAliasArg>;

	const slotsAliasLookup = useMemo(() => {
		type TEntries = Array<[TSlotAliasArg, TSlotComponentArg]>;
		type TLookup = Record<TSlotName, TSlotAliasArg>;

		const entries = Object.entries(Caller.slots) as TEntries;
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
	}, [Caller.slots]);

	const result = useMemo(() => {
		const slotNodes: TSlotNodesArg = {};
		const unmatchedChildren: ReactNode[] = [];
		const invalidChildren: any[] = [];
		const requiredSlotAliases = [
			...(Caller.requiredSlotAliases ?? [])
		];

		React.Children.forEach(children, (child) => {
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

			const slotAlias = (() => {
				const slotName = getComponentSlotName(child.type, child);

				return slotName ? slotsAliasLookup[slotName] : null;
			})();

			if (slotAlias && (typeof Caller.slots[slotAlias] !== 'string')) {
				if (Caller.slots[slotAlias]?.isRequiredSlot) {
					requiredSlotAliases.push(slotAlias);
				}
			}

			if (slotAlias) {
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
	SlotNamedComponent,     Slotted as SlottedComponent,   TSlotsRecord,
	PotentialSlotComponent,
} from './types';
