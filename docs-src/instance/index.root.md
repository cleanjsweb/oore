---
title: Instance Hook
# group: Guides
# category Discussion
---

## useInstance
With `useLogic`, most of the issues we identified with function components are addressed. The component is cleaner and the functions are more predictable. But one limitation remains.

The journey of a React component starts as a mere function until it is executed for the first time. The JSX template it returns describes what content should be inserted into the DOM. After this first execution, react generates the corresponding HTML and inserts into the DOM at the appropriate location. At this point we say that the component is "mounted". After being mounted, a component may go through multiple updates in the course of its journey through life. This happens when either it's internal state changes, or the props from its parent change. When that happens, Reacts executes the function again with this updated input, and receives an equally updated template of what the DOM should now look like based on the new input. React updates the DOM accordingly. This process repeats continously until such time as the parent or some higher ancestor returns an updated template to React that no longer includes the child component in question. At this point, the corresponding DOM element(s) which this component described are removed from the document and we say the component is unmounted.

This is the React component lifecycle. Regardless of the absence or presence or nature of an API to interface with these lifecycle processes, it is a thing that exists, conceptually. It is often very useful to hook into these lifecycle milestones to properly manage the behaviour of a component and guarantee a good user experience. This is why for both class components and function components, React provides ways of performing actions at specified points in the lifecycle of a component.

With class components, these are very obvious because of the declarative API provided. To run some code after the component is mounted, you simply put said code in a method called `componentDidMount`. It is quite straightforward. Not as much with function components, however. While you can achieve all of the same lifecycle hooks in function component as you could with class components, the API takes a more imperative approach. For example, you cannot simply say that some code should run after the component mounts through some appropriately named function. Instead, you must find the right combination of arguments to pass to `useEffect` to achieve the desired result. Working with the component lifecyle in a function component carries some extra cognitive load as a result of this.

Say you wanted some code to run _before_ a component is first mounted, for example. In a class component, you would simply put this code in the constructor. This is fairly straightforward to work out given the fact that a class has to first be instantiated, then React calls the relevant instance methods at different times to determine what to render to the DOM. Hence, to run code at the beginning of that process, you do it where the instantiation takes place, i.e the constructor.

With a function component, you may at first glance turn to `useEffect` and spend some time tinkering with it to see if there is a call signature that would achieve this. It may take some time for you to realize this cannot be done with `useEffect` at all. Instead, calling `useMemo` with an empty dependency array should produce the desired effect. This can be very unintuative considering the stated purpose of `useMemo` and the fact that your "before mount" logic probably doesn't even return a value in the first place, so the thought of using a memoization hook may never have crossed your mind, as there was no value to memoize.

Figuring these things out at the point of writing the component is one thing, but the component also likely has to be maintained long term, and even if you are very familiar with these function component patterns, it may still take you a minute of looking at a long list of hook calls to figure out which lifecycle event a given hook call is really trying to achieve. Which `useMemo` call is really meant to memoize a value and which is just a hacky workaround to hook into some lifecycle event? What if a single `useMemo` call achieves both functions, and you mistakenly remove the hook because the value is no longer needed, without realising this side-effect was also being relied on?

You might be attempting to trace the execution path of a component to better understand its behaviour at different points in its lifecycle. Instead of discreet methods for each stage, you might have to track down multiple distinct `useEffect` calls that all run at the same stage but are written many lines apart in the body of the component function.

The imperative approach for working with lifecycle in function components makes for some very unintuitive components, and at the very least adds a notable cognitive overhead to reading and writing larger components. Creating a declarative mechanism for hooking into the lifecycle of function components without having to simply switch to a class component would be a great improvement. And this is what `useInstance` achieves. Here is what it looks like:

```jsx
/** Button Component Class. */
class ButtonCC extends ComponentInstance {
	// ...
	// Static method(s), same as useLogic...
	// ...


	/* Lifecycle Methods */

	beforeMount = () => {
		// Runs before the component is first rendered.
	}

	onMount = () => {
		// Runs after the component is first rendered.
		// Same as `useEffect(() => {}, []);`

		return () => {
			// Required clean up function must be returned.
			// Return an empty function if you have no cleanup.
		};
	}

	beforeRender = () => {
		// Runs before every single render.
		// Same as code placed before the return statement in a function component.

		// Example: Generate display values from state and props,
		// and store them as instance members for use in your JSX template.
		const displayValue2 = this.hooks.memoizedValue + this.state.value2;

		this.templateContext = {
			intro: `Hello, ${this.props.name}`,
			displayValue2,
		};
	}

	onRender = () => {
		// Runs after every single render.
		// Same as `useEffect(() => {});`

		return () => {
			// Required clean up function must be returned.
			// Return an empty function if you have no cleanup.
		};
	}

	cleanUp = () => {
		// Runs when the component is unmounted.
		// Similar to the function returned by `onMount`.
	}

	/* [End] Lifecycle Methods */


	// ...
	// Other instance methods, same as useLogic...
	// ...
}

// Button Template
const Button = (props) => {
	const self = useInstance(ButtonCC, props);
	const { intro } = self.templateContext;

	return <>
		<p>{intro}</p>
		<button onClick={self.submit}>
			{self.state.label}
		</button>
	</>;
}
```

See the [API documentation](https://cleanjsweb.github.io/neat-react/classes/API.BaseClasses.ComponentInstance.html) for each lifecycle method to learn more about how it works.

With the addition of the lifecycle methods, the component logic class starts to look very much like a `React.Component` component class. It can now be thought of as a complete representation of the behaviours associated with a given component template. Each instance of this class fully represents an instance of the function component in the DOM—state,
props, and all—hence the name. `useInstance` allows your function component to consume a logical instance of itself, and operate simply as a template that transforms a self contained object with state and behaviours into a DOM subtree with UI and event listeners.

At this point, you might jokingly say, "we've basically recreated class components". We pretty much have, with one significant advantage. At its core, your component is still a function component, and can seamlessly benefit from any optimizations, improvements, or new features that React adds to function components. Its the best of both worlds. Stay on the new system, and carry over all of the advantages from the old one. The declarative lifecycle API, the ergonomics of working with state, and the cleaner structure and separation of concerns. `useInstance` gives you all of this in a neat and simple package.

Now, if we're going to work our way back to writing components as classes, why not just go all the way?
Well, actually, [we can](https://cleanjsweb.github.io/neat-react/documents/Class_Component.html).
