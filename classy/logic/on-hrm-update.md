# Custom HMR Handling
Handle complex update logic whenever your component instance is updated through HMR. This feature is available on all component logic classes, including `ComponentMethods`.

This function is called on the new instance, and it receives the old instance as its only argument. So you can access data from the old instance, and reinitialize any processes on the new instance as needed.

`_onHmrUpdate` is only relevant in development and has not effect in production environment. Accordingly, you should only assign this function when environment is development, so
that it can be tree-shaken during production builds.

@example
```js
class MyComponentLogic extends ComponentLogic {
    // Some class member definitions...

    constructor() {
        if (process.env.NODE_ENV === 'development') {
            this._onHmrUpdate = (oldInstance) => {
                // Your custom hmr logic here.
            };
        }
    }

    // Method definitions...
}
```
