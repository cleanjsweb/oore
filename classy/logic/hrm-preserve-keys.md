# Persist Class Members During HMR
Specify custom class members to be copied over whenever the class is
reinstantiated during hot module replacement.

Oore handles HMR by recreating the class instance
with the updated code whenever there is a file change.
Your component is then rerendered so that event handlers
now point to the new functions.

For this to work well, your component's state needs to be preserved,
so it is copied over from the old instance, to the newly created one.
This includes `state`, `props`, & `hooks` by default, but you can
extend it to include more properties if there are values your component expects
to be persistent.

In most cases, any values you wish to preserve should be created in `useHooks` with `React.useRef`.
Like so: 
```jsx
class MyClass extends ComponentLogic {
	// Note: `useHooks` is not available in `ComponentMethods` / `useMethods`.
	// If you're using `useMethods`, switch to `useLogic` + `ComponentLogic`
	// to access the `useHooks` method.
	// PS: To add refs as instance properties in ComponentMethods, create the ref in the function component's body
	// and assign it to the appropriate instance member. Keep scrolling for an example.
	useHooks = () => {
		// You can use an instance property.
		this.myAttr = useRef('my-attribute');

		// Or add it to the `this.hooks` object.
		return {
			inputId: useRef('input-id'),
		};
	};

	myMethod = () => {
		this.myAttr.current = 'new-value';
		this.hooks.inputId.current = 'new-value';

		console.log({
			classMember: this.myAttr.current,
			hooksObject: this.hooks.inputId.current,
		});
	};
}

const MyInput = (props) => {
	const self = useLogic(MyClass, props);

	// Or, with useMethods...
	const methods = useMethods(/* ...args */);
	methods.myAttr = useRef('input-id');

	return (
		<input
			id={self.hooks.inputId.current}
			data-attr={self.myAttr.current}
			// Or:
			data-attr2={methods.myAttr.current}
		/>
	);
}
```

If you use a ref in this way, React will preserve it for you, and there will be no need
to use `_hmrPreserveKeys`.

`_hmrPreserveKeys` is only relevant in development and has not effect in production environment.
Accordingly, you should only create this array when environment is development, so
that it can be tree-shaken during production builds.

@example <caption>Specify additional properties to be considered stateful, in addition to `state`, `props`, and `hooks`.</caption>
```ts
MyComponentMethods extends ComponentMethods {
	// Some class member definitions...

	constructor() {
		if (process.env.NODE_ENV === 'development') {
			this._hmrPreserveKeys = ['inputId', 'unsubscribeCallback'];
		}
	}

	// Method definitions...
}
```

With the above example, whenever HMR occurs, `this.inputId` and `this.unsubscribeCallback`
will maintain there existing values, just like state, props, and hooks.
Meanwhile everything else will be recreated.

PS: Since the code is written in an environment condition, it should naturally be stripped from the
production build to avoid shipping dead code.
