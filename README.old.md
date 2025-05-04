# Structured & Cleaner React Function Components

## Quick Start
This package provides a suite of tools for writing cleaner React function components. It is particularly useful for larger components with lots of state variables and multiple closure functions that need to access those variables. The most likely use cases will use one of the three main exported members.

> The following sections will use examples to demonstrate how each tool can be used. These example are intended to be read as a before and after comparison. They are all based on the same "before" code, which is shown below:


### Our Sample React Function Component
```jsx
const Footer = (props) => {
	const [state1, setState1] = useState(props.defaultValue);
	const [state2, setState2] = useState();
	const [label, setLabel] = useState('Click me');
	const [submitted, setSubmitted] = useState(false);

	const [store, updateStore] = useGlobalStore();

	const { param } = props;


	// Required to run once *before* the component mounts.
	const paragraphs = useMemo(() => getValue(param), [param]);


	/** @todo Use `useSyncExternalStore`. */
	const subscribeToExternalDataSource = useCallback(() => {
		externalDataSource.subscribe((data) => {
			setLabel(data.label);
		});
	}, [setLabel]);

	// Required to run once *after* the component mounts.
	useEffect(subscribeToExternalDataSource, []);
	useEffect(() => {
		const onWindowResize = () => {};
		window.addEventListener('resize', onWindowResize);

		return () => {
			window.removeEventListener('resize', onWindowResize);
		};
	}, []);

	// Run *after* every render.
	useEffect(() => {
		doSomething();
		return () => {};
	})

	const submit = useCallback(() => {
		sendData(state1, state2);
		setSubmitted(true);
	}, [state1]); // Notice how `state2` above could easily be stale by the time the callback runs.


	// Run before every render.
	const text = `${label}, please.`;

	return (
		<footer>
			{paragraphs ? paragraphs.map((copy) => (
				<p>{copy}</p>
			)) : null}

			<button onClick={submit}>
				{text}
			</button>
		</footer>
	);
};

export default Footer;
// Or use in JSX as `<Footer />`.
```


### A Cleaner State Management API
The `useCleanState` hook provides a cleaner API for working with state, particularly in components with a relatively high number of state variables. It allows you to manage multiple state variables as a single unit. You will likely find this cleaner to work with than having multiple local variables for each state. The example below demonstrates the use of this hook.


### Extracting and Structuring Component Logic
The `useLogic` hook allows you to write your component's logic outside the function component's body, and helps you keep them all better organized. It also provides a much cleaner API for working with multiple state variables. Here's what a function component looks like with the `useLogic` hook.

**Before**
[See the "before" code above](#our-sample-react-function-component).

**After**
```jsx
class FooterLogic {
	static getInitialState = (props) => {
		return {
			state1: props.defaultValue,
			state2: undefined,
			label: 'Click me',
			submitted: false,
		};
	};

	subscribeToExternalDataSource = () => {
		externalDataSource.subscribe((data) => {
			this.state.label = data.label;
		});
	}

	useHooks = () => {
		const [store, updateStore] = useGlobalStore();
		const { param } = this.props;

		// Required to run once *before* the component mounts.
		const paragraphs = useMemo(() => getValue(param), [param]);

		// Required to run once *after* the component mounts.
		useEffect(this.subscribeToExternalDataSource, []);
		useEffect(() => {
			const onWindowResize = () => {};
			window.addEventListener('resize', onWindowResize);

			return () => {
				window.removeEventListener('resize', onWindowResize);
			};
		}, []);

		// Run *after* every render.
		useEffect(() => {
			doSomething();
			return () => {};
		});

		return {
			store,
			updateStore,
			paragraphs,
		};
	};

	submit = () => {
		const { state1, state2 } = this.state;
		sendData(state1, state2);
		this.state.submitted = true;
	}; // `state2` is never stale. All `state` and `props` references return the latest value. No extra steps required.
}

// Footer Template
const Footer = (props) => {
	const self = useLogic(FooterLogic, props);

	const { paragraphs } = self.hooks;
	const { state } = self;

	// Run before every render.
	const text = `${state.label}, please.`;

	return (
		<footer>
			{paragraphs ? paragraphs.map((copy) => (
				<p>{copy}</p>
			)) : null}

			<button onClick={self.submit}>
				{text}
			</button>
		</footer>
	);
};

export default Footer;
// Or use in JSX as `<Footer />`.
```

The `useLogic` hook combines the functionality of two base hooks which can also be used directly. They are [`useCleanState`](https://cleanjsweb.github.io/neat-react/clean-state/index) and [`useMethods`](https://cleanjsweb.github.io/neat-react/methods/index). `useCleanState` can be used independently if you only want a cleaner state management API. `useMethods` is designed to be used together with `useCleanState`, but rather than calling both individually, you may find it more convenient to use `useLogic`, which combines both as well as the added functionality of the `useHooks` method.

> It is possible to have multiple calls to `useLogic` in the same component. This allows your function component template to consume state and logic from multiple sources, or it can simply be used to group distinct pieces of related logic into separate classes.

For a fuller discussion of how `useLogic` works, start at the [clean-state documentation](https://cleanjsweb.github.io/neat-react/clean-state/index).    
For an API reference, see the [API reference](https://cleanjsweb.github.io/neat-react/logic/api).


### Working With Lifecycle, and Migrating From a React.Component Class to a Function Component
In addition to having cleaner and more structured component logic, you can also simplify the process of working with your component's lifecycle with the final two exported members. The `useInstance` hook builds on the functionality of `useLogic` and adds lifecyle methods to the class. This means the class can now be thought of as truly representing a single instance of a React component. The `ClassComponent` class extends this to its fullest by allowing you to write the function component itself as a method within the class, and removing the need to explicitly call `useInstance`.

**Before**
[See the "before" code above](#our-sample-react-function-component).

**After**
```jsx
class Footer extends ClassComponent {
	// Call the static method extract() to retrieve the renderer for your class.
	// This is a function that you can render like any other function component.
	// Each instance of the renderer in your component tree will create its own instance of the class.
	static readonly RC = Button.extract();

	static getInitialState = (props) => {
		return {
			state1: props.defaultValue,
			state2: undefined,
			label: 'Click me',
			submitted: false,
		};
	};

	useHooks = () => {
		const [store, updateStore] = useGlobalStore();
		return { store, updateStore };
	}

	/***************************
	 *  New Lifecycle Methods  *
	 ***************************/

	beforeMount = () => {
		this.paragraphs = getValue();
	}

	// Run after the component is mounted.
	onMount = () => {
		this.subscribeToExternalDataSource();
		window.addEventListener('resize', this.onWindowResize);

		// Return cleanup callback.
		return () => {
			window.removeEventListener('resize', this.onWindowResize);
		};
	}

	beforeRender = () => {
		this.text = `${label}, please.`;
	}

	// Run after every render.
	onRender = () => {
		doSomething();

		// Return cleanup callback.
		return () => {};
	}

	cleanUp = () => {
		// Run some non-mount-related cleanup when the component dismounts.
		// onMount (and onRender) returns its own cleanup function.
	}

	/***************************
	 * [End] Lifecycle Methods *
	 ***************************/

	submit = () => {
		// Methods are guaranteed to have access to the most recent state values.
		const { state1, state2 } = this.state;

		sendData(state1, state2);

		// CleanState uses JavaScript's getters and setters, allowing you to assign state values directly.
		// The effect is the same as if you called the setter function, which is available through `state.put.submitted(true)`.
		this.state.submitted = true;
	}

	onWindowResize = () => {};

	subscribeToExternalDataSource = () => {
		const unsubscribe = externalDataSource.subscribe((data) => {
			this.state.label = data.label;
		});

		return unsubscribe;
	}

	/** You can also separate out discreet chunks of your UI template. */
	Paragraphs = () => {
		if (!this.paragraphs) return null;

		return this.paragraphs.map((content, index) => (
			<p key={index}>
				{content || this.state.label}
			</p>
		));
	}

	/** Button Template */
	template = () => {
		const { Paragraphs, submit, state } = this;

		return (
			<Fragment>
				<Paragraphs />

				{/* You can access the setter functions returned from useState through the state.put object. */}
				{/* This is more convenient than the assignment approach if you need to pass a setter as a callback. */}
				{/* Use state.putMany to set multiple values at once. It works just like setState in React.Component classes. */}
				{/* e.g state.inputValue = 'foo', or state.put.inputValue('foo'), or state.putMany({ inputValue: 'foo' }) */}
				<CustomInput setValue={state.put.inputValue} />

				<button onClick={submit}>
					{this.text}
				</button>
			</Fragment>
		);
	}
}

// Can also be used directly in JSX as `<Button.RC />`.
export default Button.RC;
```

> If you would like to keep the actual function component separate and call `useInstance` directly, see the [`useInstance` docs](https://cleanjsweb.github.io/neat-react/instance/index) for more details and examples.

At its core, any component you write with `ClassComponent` is still just a React function component, with some supporting logic around it. This has the added advantage of making it significantly easier to migrate class components written with `React.Component` to the newer hooks-based function components, while still maintaining the overall structure of a class component, and the advantages that the class component approach provided.

For a fuller discussion of how this works, start at the [`useInstance` documentation](https://cleanjsweb.github.io/neat-react/instance/index).    
For more details on the lifecycle methods and other API reference, see the [`ClassComponent` API docs](https://cleanjsweb.github.io/neat-react/class-component/api).

### The `<Use>` Component
If you only want to use hooks in your `React.Component` class without having to refactor anything, use the [`Use` component](https://cleanjsweb.github.io/neat-react/class-component/index#the-use-component).

```jsx
class Button extends React.Component {
	handleGlobalStore = ([store, updateStore]) => {
		this.setState({ userId: store.userId });
		this.store = store;
		this.updateStore = updateStore;
	}

	UseHooks = () => {
		return <>
			<Use hook={useGlobalStore}
				onUpdate={handleGlobalStore}
				argumentsList={[]}
				key="useGlobalStore"
			/>
		</>;
	}

	render() {
		const { UseHooks } = this;

		return <>
			<UseHooks />

			<button>Click me</button>
		</>;
	}
}
```
