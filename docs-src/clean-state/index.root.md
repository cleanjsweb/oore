---
title: Clean State
# group: Documents
# category Guides
children:
    - ./merged-state/index.md
---

# Cleaner State Management for React Function Components
[API](https://cleanjsweb.github.io/neat-react/functions/API.useCleanState.html).

Say you have a component with some state like this:

```jsx
const Button = (props) => {
	const [label, setLabel] = useState('Click me');
	const [clicked, setClicked] = useState(false);
	const [state3, setState3] = useState(props.defaultValue);

	return (
		<button onClick={() => setClicked(true)}>
			{label}
		</button>
	);
}
```

As noted in the [introductory page](../why.root.md), you may consider writing a custom hook to simplify working with these state values.
```jsx
const useButtonState = (props) => {
	const [label, setLabel] = useState('Click me');
	const [clicked, setClicked] = useState(false);
	const [state3, setState3] = useState(props.defaultValue);

	const _set = {
		label: setLabel,
		clicked: setClicked,
		state3: setState3,
	};

	return { label, clicked, state3, _set };
}

const Button = (props) => {
	const state = useButtonState(props);

	return (
		<button onClick={() => state._set.clicked(true)}>
			{label}
		</button>
	);
}
```
> **Sidebar:** Of course this example is only for illustrative purposes. This change would be somewhat unnecessary for a component as small as our `Button` example here. A setup like this is mostly only useful for larger components with a lot of seperate state variables.

Separating things out like this makes the component look much smaller and definitely much easier to read.

If you have a larger function component, you can probably see how a pattern like this would simplify your component's logic and improve readability. It's also possible to improve this and have `_set` dynamically generated, which will reduce the boilerplate needed to add a new state variable.

## useCleanState
`useCleanState` adds this and a handful of other improvements, making it easy for you to define state variables in a way that doesn't clutter your components, and work with those variables in very convenient ways. Here is what our `Button` component might look like with the `useCleanState` hook:

```jsx
const initialState = {
	label: 'Click me',
	clicked: false,
	inputValue: {},
}

const Button = () => {
	const state = useCleanState(initialState);

	const onClick = useCallback(() => {
		state.clicked = true;
	}, []);

	return <>
		<CustomInput setValue={state.put.inputValue}>

		<button onClick={onClick}>
			{state.label}
		</button>
	</>;
}
```

1. `put` holds setter functions that can be passed around conveniently. Each key in your state object gets a corresponding setter function of the same name in the `state.put` object. This means you cannot have a value named `put` in your state object, as it is a reserved name. To set multiple values simultaneously, use `state.putMany`, which works just like `React.Component`'s `setState` function.

2. Using JavaScript setters, state properties can also be assigned directly, with the same effect as if you called the setter function.
	1. Note that this only works when referencing the property directly on the state object, as in `state.clicked = true`. It will not have the intended effect if the value if first assigned to a separate local variable. So the example below will simply update the local varibale without actually updating the component's state:
	```jsx
	let { clicked } = useCleanState({ clicked: false });
	const onClick = () => clicked = true;
	```
	As a rule of thumb, if you are extracting individual values from the state object, use `const` so it's clear that the ephemeral copy you've created shouldn't be reassigned.


But say we want to set the initial `inputValue` in the example above based on a prop. We might consider moving the `initialState` object into the component and passing it as a literal to `useCleanState`. But that seems like it would undo some of the decluttering advantages of the hook. To avoid that, you can pass a function instead, and a second argument which will be forwarded on that function. The second argument can be anything: the entire props object, a specific primitive value, or perhaps a tuple (i.e an array of arguments).

> Note that `useCleanState` can be called multiple times in the same component if you prefer to have you component's state grouped into separate objects.

```jsx
const initState = ({ defaultValue }) => {
	return {
		label: 'Click me',
		clicked: false,
		inputValue: defaultValue,
	};
}

const Button = (props) => {
	const state = useCleanState(initState, props);

	return <>
		<CustomInput setValue={state.put.inputValue}>
		<button onClick={() => state.put.clicked(true)}>
			{state.label}
		</button>
	</>;
}
```
