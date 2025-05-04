---
title: Logic Hook
group: Guides
# category Discussion
# children: 
#     - ../../../api-docs/functions/useLogic.md
---


## useLogic
[`useLogic` API](https://cleanjsweb.github.io/neat-react/functions/API.useLogic.html) for more details.

This hook combines the functionality of `useCleanState` and `useMethods`, and also introduces a new special method, allowing you to truly extract all of your components logic from the main function body.

The method in question is called `useHooks`, and allows you to call react hooks from the Methods class instead of the function component's body. With this addition, you can fully have separation of concerns, with the main component function being just a template, and all of the logic that supports that template neatly grouped as methods within a Logic class.

Here's an example.

```jsx
class ButtonLogic {
	static getInitialState = () => {
		return {
			value1: undefined,
			value2: null,
			label: 'Click me',
			submitted: false,
		};
	}

	submit = async () => {
		const { value1, value2 } = this.state;
		await sendData(value1, value2);
		this.state.submitted = true;
	}

	doSomething = () => {
		// Setup...

		return () => {
			// Cleanup...
		}
	}

	useHooks = () => {
		const { param } = this.props;

		useEffect(this.doSomething, []);

		const memoizedValue = useMemo(() => getValue(param), [param]);
		const value2 = useCustomHook();

		return {
			memoizedValue,
			value2,
		};
	}
}

// Button Template
const Button = (props) => {
	const { state, hooks, ...methods } = useLogic(ButtonLogic, props);

	return <>
		<p>{hooks.memoizedValue}</p>
		<button onClick={methods.submit}>
			{state.label}
		</button>
	</>;
}
```
