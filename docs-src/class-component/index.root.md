---
title: Class Component
group: Guides
# category Discussion
---

## ClassComponent
This class builds on `useInstance` with one simple addition. It moves the function component template into the class as an instance method. This allows the class to truly be a self contained entity containing everything that makes up the component.

When you write a class that extends `ClassComponent`, you no longer need to call `useInstance` in the template function. This is handled for you internally. Your template method can instead access the component instance using the `this` keyword, as it is now part of the class, and therefore part of the instance.

ClassComponent classes cannot be rendered as JSX directly. Instead, you call the static `extract` method on the class, which returns a regular function component that wraps your template method. This extracted function component can then be passed around and rendered as JSX anywhere, just like a regular function component.

The example below shows how to use it.

```jsx
class Button extends ClassComponent {
	/** RC -> React Component */
	static RC = Button.extract();
	// Or...
	static RC = this.extract(); // Here, `this` refers to the class itself (not an instance), because of the "static" keyword.

	// ...
	// Other class members, same as useInstance...
	// ...

	beforeRender = () => {
		const displayValue2 = this.hooks.memoizedValue + this.state.value2;

		return {
			intro: `Hello, ${this.props.name}`,
			displayValue2,
		};
	}

	/** Button Template */
	template = (context) => (
		<section>
			<p>{context.intro}</p>

			<button onClick={this.submit}>
				{this.state.label}
			</button>
		</section>
	);
}

// Or: render directly with `<Button.RC />`.
export default Button.RC;
```

## Migrating From `React.Component`
Having a class-based way to use React's function components makes it much easier to migrate older `React.Component` classes to function components, while maintaining much of their existing semantics. If you want to move because class components are increasingly being discouraged, or because you would like to be able to use React hooks, the `ClassComponent` class allows you to do this with significantly less effort. See below for a side-by-side comparison.

**`React.Component`**
```jsx
import { Use } from '@cleanweb/oore/helpers';

class Button extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			state1: props.defaultValue,
			state2: null,
			label: 'Click me',
			submitted: false,
		};
	}

	componentDidMount() {
		this.unsubscribe = this.subscribeToExternalDataSource();
	}

	componentWillUnmount() {
		this.unsubscribe();
		doSomethingElse();
	}

	subscribeToExternalDataSource = () => {
		return externalDataSource.subscribe((data) => {
			this.setState({label: data.label });
		});
	}

	submit = () => {
		const { state1, state2 } = this.state;
		sendData(state1, state2);
		this.setState({ submitted: true });
	}

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

			<button onClick={this.submit}>
				{this.state.label}
			</button>
		</>;
	}
}
```

**`ClassComponent`**
```jsx
class Button extends ClassComponent {
	static RC = Button.extract();

	static getInitialState = (props) => {
		return {
			state1: props.defaultValue,
			state2: null,
			label: 'Click me',
			submitted: false,
		};
	}

	useHooks = () => {
		// Or: useSyncExternalStore();
		useEffect(this.subscribeToExternalDataSource, []);

		const memoizedValue = useMemo(() => getValue(props.param), [props.param]);
		[this.store, this.updateStore] = useGlobalStore();

		return {
			memoizedValue,
		};
	}

	onMount = () => {
		const unsubscribe = this.subscribeToExternalDataSource();
		return () => {
			unsubscribe();
		};
	}

	cleanUp = () => {
		doSomethingElse();
	}

	submit = () => {
		const { state1, state2 } = this.state;
		sendData(state1, state2);
		this.state.submitted = true;
	}

	subscribeToExternalDataSource = () => {
		return externalDataSource.subscribe((data) => {
			this.state.label = data.label;
		});
	}

	/** Button Template */
	template = () => <>
		<p>{this.hooks.memoizedValue}</p>
		<button onClick={this.submit}>
			{this.state.label}
		</button>
	</>;
}

export default Button.RC;
```

## What About `this`?
In most cases, this is a non-issue when writing modern JavaScript. _Just use an arrow function._

In methods defined as arrow functions, using `this` will always refer to the specific class instance where the method came from, regardless of how the method gets passed around.

This is sufficient for most use cases within the context of day-to-day component methods. If you want to do something more complex with the "this" context or prototype inheritance in general, like calling ["super.myMethod()"](https://javascript.info/class-inheritance), then [javascript.info has very straightforward breakdowns of `this`](https://javascript.info/object-methods#this-in-methods), and other [inheritance concepts in JavaScript](https://javascript.info/prototype-inheritance), which should help you clarify any potentially unclear behaviours.

Rest assured, it is far from inscrutable, and you can certainly use it effectively if needed. Regardless, you almost never have to think about `this` if you just use arrow functions in your classes. So such concerns are not particularly relevant to this use case.

## The `<Use>` Component
If you simply want to use hooks in your `React.Component` class without having to rewrite anything, this library also exports a `<Use>` component that helps you achieve this easily. Here's how to use it.

```jsx
import { Use } from '@cleanweb/oore/helpers';
import { useGlobalStore } from '@/hooks/store';

class Button extends React.Component {
	syncGlobalStore = ([store, updateStore]) => {
		this.setState({ userId: store.userId });
		this.store = store;
		this.updateStore = updateStore;
	}

	UseHooks = () => {
		return <>
			<Use hook={useGlobalStore}
				onUpdate={syncGlobalStore}
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

The provided hook is called with the `argumentsList` array passed in (the array is spread, so each item in the list is a separate argument). The return value from the hook is passed on to the `onUpdate` callback. So ypu can use this to update your component's state and trigger a rerender when something changes.
