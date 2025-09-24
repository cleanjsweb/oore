import type { ReactElement, ReactNode } from 'react';
import type { IUseSlots, PotentialSlotComponent, TSlotName, TSlotNodes } from './types';

import { throwDevError } from '@/helpers/errors';
import React from 'react';


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
	if (typeof TargetComponent === 'string') {
		return TargetComponent;
	}
	else if ('slotName' in TargetComponent) {
		return TargetComponent.slotName;
	}
	else if ('displayName' in TargetComponent) {
		return TargetComponent.displayName;
	}
	else if (child) {
		const keyTypes = ['string', 'number', 'symbol'];
		const slotName = child.props['data-slot-name'];

		if (keyTypes.includes(typeof slotName)) {
			return slotName;
		}

		else return undefined;
	}
	else return undefined;
};

export const useSlots: IUseSlots = (children, slotComponents) => {
	type TSlotsRecordArg = typeof slotComponents;

	type TSlotAliasArg = keyof TSlotsRecordArg;
	type TSlotComponentArg = valueof<TSlotsRecordArg>;

	type TSlotNodesArg = TSlotNodes<TSlotAliasArg>;

	const { useMemo } = React;

	console.log({ slotComponents });

	const slotsAliasLookup = useMemo(() => {
		type TEntries = Array<[TSlotAliasArg, TSlotComponentArg]>;
		type TLookup = Record<TSlotName, TSlotAliasArg>;

		const entries = Object.entries(slotComponents) as TEntries;
		const aliasLookup = {} as TLookup;

		entries.forEach(([alias, RegisteredSlotComponent]) => {
			const slotName = getComponentSlotName(RegisteredSlotComponent);
			if (!slotName) {
				throwDevError(`A registered slot component did not have a slot name. All components registered as slots must either be a string tag-name or a React component with either "slotName" or "displayName". The affected component was: ${RegisteredSlotComponent}`);
				return;
			}
			return aliasLookup[slotName] = alias;
		});

		return aliasLookup;
	}, [slotComponents]);

	console.log({ slotsAliasLookup });

	const result = useMemo(() => {
		const slotNodes: TSlotNodesArg = {};
		const unmatchedChildren: ReactNode[] = [];
		const invalidChildren: any[] = [];

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

			if (!isElementChild(child)) {
				unmatchedChildren.push(child);
				return;
			}

			const slotAlias = (() => {
				const slotName = getComponentSlotName(child.type, child);

				return slotName ? slotsAliasLookup[slotName] : null;
			})();

			console.log('match:', { key: slotAlias });

			if (slotAlias) slotNodes[slotAlias] = child;
			else unmatchedChildren.push(child);
		});

		console.log({ unmatchedChildren, invalidChildren });
		return [slotNodes, unmatchedChildren, invalidChildren] as const;
	}, [children]);

	return result;
};


export type {
	SlotNamedComponent,     SlottedComponent,   TSlotsRecord,
	PotentialSlotComponent,
} from './types';
