import type { VoidFunctionComponent } from 'react';
import type { ClassComponent } from '..';


type BaseCCConstructor = typeof ClassComponent<object>;

export type Extractor = <TComponentClass extends BaseCCConstructor>(
	this: TComponentClass,
	Component?: TComponentClass
) => VoidFunctionComponent<InstanceType<TComponentClass>['props']>;
