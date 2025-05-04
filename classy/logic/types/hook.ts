import type { ComponentLogic, TPropsBase } from '..';


/*************************************
 *        # Hooks                    *
**************************************/


// type ULClassParam = typeof ComponentLogic<NonNullable<TPropsBase>>;
type ULClassParam = typeof ComponentLogic<NonNullable<any>>;
type ULProplessClassParam = typeof ComponentLogic<null>;

export type UseLogic = {
    <Class extends ULProplessClassParam>(
        Methods: Class
    ): InstanceType<Class>;

	<Class extends ULClassParam>(
        Methods: Class,
		props: InstanceType<Class>['props']
	): InstanceType<Class>;
}

export type ULParams = [
	Class: typeof ComponentLogic<any>,
	props?: object
]

export type ULReturn = ComponentLogic<any>;
