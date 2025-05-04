
interface HookWrapperProps<THookFunction extends AnyFunction> {
	/**
	 * The React hook you which to consume.
	 * Render a separate instance of the `<Use />` component for each hook.
	 * You can also create a custom hook that combines multiple hooks,
	 * then use that wrapper hook with a single `<Use />` instance.
	 */
	hook: THookFunction,

	/**
	 * An array containing the list of arguments
	 * to be passed to your hook, in the right order.
	 */
	argumentsList: Parameters<THookFunction>,

	/**
	 * A callback that will be called with whatever value your hook returns.
	 * Use this to update your component's state with the value.
	 * This will allow your component to rerender whenever the hook returns a new value.
	 */
	onUpdate: (output: ReturnType<THookFunction>) => void,
}

export type ClassComponentHookWrapper = <Hook extends AnyFunction>(
	props: HookWrapperProps<Hook>
) => null;

