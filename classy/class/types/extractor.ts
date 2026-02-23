import type { VoidFunctionComponent } from 'react';
import type { ClassComponent } from '..';


type BaseCCConstructor = typeof ClassComponent<object>;

export type Extractor = <
		TComponentClass extends BaseCCConstructor,
		TProperties extends {} = {}>(
	this: TComponentClass,
	Component?: TComponentClass | null,
	properties?: TProperties
) => NonNullable<TProperties> & VoidFunctionComponent<InstanceType<TComponentClass>['props']>;
