---
title: Methods Hook
# group: Guides
# category Discussion
---


# `useMethods`
Returns an instance of a class which holds methods for use in your component. Methods on this instance are guaranteed to always have access to the latest props and state via `this.props` and `this.state` respectively.

[API](https://cleanjsweb.github.io/neat-react/functions/API.useMethods.html).

## useMethods
When thinking about cleaning up function components, another concern is the closure functions that require up-to-date access to state variables and props, and thus cannot simply be defined outside the component. Consider the following example.

```jsx
const Button = () => {
	const [state1, setState1] = useState();
	const [state2, setState2] = useState();
	const [submitted, setSubmitted] = useState(false);

	const submit = useCallback(() => {
		sendData(state1, state2);
		setSubmitted(true);
	}, [state1]);

	return (
		<button onClick={submit}>
			Click me
		</button>
	);
}
```

While this example depicts perfectly valid JavaScript, it has an issue that may be obvious to some React devs. If `state2` is updated after `state1`, and before `submit` executes, then the latest value of `state2` will not be sent. Instead, we end up submitting stale data without realizing it. This is because `state2` isn't included in the dependency array, and thus the submit function doesn't get updated if that value changes. A previous copy if the function is returned instead, which maintains access to the values from that previous render of the component, and is completely blind to the latest values.

React officially solves this problem with linting rules that show errors or warnings if a value is used in a callback but omitted from the dependency array. But linting offers no runtime protection or guarantees, and it is not too difficult for linting to become misconfigured, or silenced in some cases. As an example, some versions of these lint rules may prompt you to include the state setter functions in the dependency array, which is unnecessary as the reference identity of the function useState returns is always the same across rerenders. This is one of those things that might lead someone to silence linting issues on a specific line.

Whether a misconfiguration or deliberate disabling for whatever reason, the absence of the linting validation in any part of your React component does not create any warning or error. This means in our example above, you could very easily have that errorneous code executed at runtime, carrying on silently with no indication that anything is wrong. This leads to unexpected results that can be notoriously difficult to debug.

Of course you could just drop the `useCallback` and declare the function directly, allowing it to be recreated on every single rerender. The one downside is that because it is a new function every single rerender, you may end up with more frequent rerenders than necessary if the function is passed as a prop to a child component, which is a runtime performance drawback. And you do still end up with the initial of clutter within the component function, making the logic difficult to follow.

A primary benefit of functions in a programming language is encapsulating discreet pieces of logic. By forcing all functions to be defined as closures in order to maintain access to component state, React function components have a considerably limited ability to take advantage of this very important language feature.

Once again, much can be achieved by just being more deliberate about separating concerns and leveraging custom hooks where necessary. But the ergonomics of this might be undesirable as, for example, the number of separate arguments your functions and hooks might need could get somewhat long, depending on how much state they need to operate on. Interestingly the [useState hook](#Use-Clean-State) could simplify this quite a bit. Meanwhile, extracting logic this way also means additional cognitive load as you have to think of each function as an external abstraction and set up and agreeable API between the external function and the calling component. It would certainly be much better if discreet pieces of component logic can be externalized from the main component function, while also maintaining access to all of the component's latest state and props.

If you've been writing React for a few years, you may be thinking about Class components by now. And, well, yes. But [you probably don't want to write `React.Component` class components today](https://feranmi.dev/posts/react-class-components-in-2024). Yet, as it happens, the logic of what we're trying to achieve naturally leads to classes and an object-oriented programming paradigm. We are, afterall, building on top of the browsers "Document **Object** Model". So it makes sense that an object-oriented approach would be most intuitive and thus, less error prone.

But, let us begin from first principles. We return to our example component, and attempt to leverage custom hooks, with state received through arguments.

```jsx
const submit = (state1, state2, setSubmitted) => {
	sendData(state1, state2);
	setSubmitted(true);
}

const Button = () => {
	const [state1, setState1] = useState();
	const [state2, setState2] = useState();
	const [submitted, setSubmitted] = useState(false);

	return (
		<button onClick={() => submit(state1, state2, setSubmitted)}>
			{label}
		</button>
	);
}
```

This solves most of our concerns. The logic is extracted from the main component, so it's cleaner; the function's reference identity is constant throughout the components lifecycle, so we _could_ avoid unnecessary rerenders in some cases (see below); and there is no risk of executing with stale data since all required values must be explicitly passed in as arguments, and are captured at the moment the function is called.

Unfortunately, a limitation shows up if we need to pass the function as a prop to a child component, and it requires arguments from the parent's context. Unlike with closures and `useCallback`, this standalone function does not encapsulate all of the values it needs to operate successfully. Instead they must be provided at call time. But in this specific example, the child component doesn't and shouldn't have access to, or know about, these values. So to get around this, we must wrap it ourselves.

We could do this with an inline function as shown in the onClick prop above. Now once again, we are back to passing a function that is freshly created on every rerender.

Alternatively, we could improve that with a 2-line `useCallback` approach like so:

```jsx
// Declare arguments separately to ensure that the arguments passed never fall out of sync with the dependency array.
const args = [state1, state2, setSubmitted];
const _submit = useCallback(() => submit(...args), args);

return (
	<button onClick={_submit}>
		{label}
	</button>
);
```

This of course means we sacrifice some of the decluttering gains from fully externalizing the function, but the improvement is worth the added 2 lines.

And of course there is the problem of the ever increasing arguments list, which makes for somewhat poor ergonomics. This can also be improved with `useCleanState`.

So, our attempt at improving the initial example can once again evolve. See the improved version below.

```jsx
const _submit = (state, props) => {
	sendData(state.state1, state.state2);
	state.submitted = true;
}

const initialState = {
	state1: undefined,
	state2: null,
	submitted: false,
}

const Button = (props) => {
	const state = useCleanState(initialState);
	const submit = useCallback(() => _submit(state, props), [state, props]);

	return (
		<button onClick={submit}>
			{label}
		</button>
	);
}
```

This is noticeably a cleaner function component than what we started with. And the improvement becomes more pronounced the larger your component is. But it would be undesirably repetitve to have to make the `useCallback` call for every single piece of logic your component uses. Of course this is only needed for functions that will be passed as props. Functions called from `useEffect`, for instance, can call the external function directly without needing the `useCallback` wrapper.

Regardless, it would be nice to get rid of the boilerplate altogether, and have a straighforward way to define multiple separate functions outside the component body that can be used conveniently within the component without having to worry about stale data or reference identities.

`useMethod` completely simplifies this. It allows you write component logic outside the component's main function body, in any number of separate functions, and guarantees that they will always have access to the latest versions of state and props. You instantiate all of your component's external functions with a single call to the hook, and can then use them throughout the component or pass them as props without any additional concerns. The implementation assumes that it will be used together with `useCleanState`. See the example below.

```jsx
class ButtonMethods {
	submit = () => {
		const { state1, state2 } = this.state;
		sendData(state1, state2);
		this.state.submitted = true;
	}

	doSomething = () => {
		// Setup...

		return () => {
			// Cleanup...
		}
	} 
}

const initialState = {
	state1: undefined,
	state2: null,
	label: 'Click me',
	submitted: false,
}

const Button = (props) => {
	const state = useCleanState(initialState);
	const methods = useMethods(ButtonMethods, state, props);

	useEffect(methods.doSomething, []);

	return (
		<button onClick={methods.submit}>
			{state.label}
		</button>
	);
}
```

> Note that if you are using multiple calls to `useCleanState`, you will have to group all the state objects together into a single object to pass to `useMethods`. This is necessary if you want your methods to have access to all individual state objects. The instance returned by each call to `useMethods` only has access to the state object passed in to the `useMethods` call.

> Fun Fact: The above reveals a new avenue for consuming pieces of shared logic between components, and giving them access to a subset of your component's state. You can import multiple `Methods` classes and instantiate each with a separate `clean-state` object. Whether this is something you would want to — or even should — do is another question. But the option is there if you want or need it.

<div style="display:flex;justify-content:space-between;align-items:center;">
	<a href="">
		Previous (useCleanState)
	</a>
	<a href="">
		Next (useLogic)
	</a>
</div>
