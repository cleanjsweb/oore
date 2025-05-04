---
title: Why Object Oriented React?
group: Guides
# category Discussion
---


For an introduction to Oore, [visit the quick start doc](https://cleanjsweb.github.io/neat-react).

# Structured React Function Components
If you've had to maintain larger React function components, you may relate to the feeling of it feeling cluttered, with logic that can be difficult to follow.

- Ever increasing number of state variables and setter functions.
- Scattered set of useEffect calls, with relationships between them that are difficult to track.
- Functions that need access to state being new every render, potentially causing unnecessary re-renders when passed as props.
- Using useCallback to fix the above but needing to closely watch the deps array to avoid unknowingly ending up with a single variable going stale because it was accidentally omitted from the deps.
- Having to rely on linters to hopefully catch things that ideally shouldn't be at risk of being an issue in the first place.
- Keeping track of which combination of useEffect/useMemo will run your function at the precise point that you want in the component's lifecycle.

Interestingly you can solve some of this with custom hooks. Mostly those that have to do with clutter and not logic. But determining what to extract into a hook may not be straightforward, and you may find it infeasible to get a whole team onboard with doing this consistently because of the added cognitive load it introduces to the process of creating or updating components.

`clean-react` provides a way to address these issues with a set of simple, layered abstractions that help you write cleaner function components without any cognitive overhead. With `clean-react`, your function components will be declarative, more structured, less error-prone, less prone to performance issues, and overall easier to reason about and maintain.

It is particularly useful for larger components with lots of state variables and multiple closure functions that need to access those state variables.

