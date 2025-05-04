import { TPropsBase } from '@/classy/logic';
import { ComponentInstance } from '..';


// type UIClassParam = typeof ComponentInstance<NonNullable<TPropsBase>>;
type UIClassParam = typeof ComponentInstance<NonNullable<any>>;
type UIProplessClassParam = typeof ComponentInstance<null>;


export type UseInstance = {
	<Class extends UIProplessClassParam>(
		Methods: Class
	): InstanceType<Class>;

	<Class extends UIClassParam>(
		Methods: Class,
		props: InstanceType<Class>['props']
	): InstanceType<Class>;
};

export type UIParams = [
	Class: typeof ComponentInstance<any>,
	props?: object
];

export type UIReturn = ComponentInstance<any>;

