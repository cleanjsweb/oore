type TRecord = Record<keyof any, any>;

namespace _ObjectGate {
	/** Configure property access for a proxy object. */
	export interface IGateConfig<TSource extends TRecord> {
		/**
		 * The keys to be exposed for read access through the proxy.
		 * Defaults to [`Reflect.ownKeys(source)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys) —
		 * so if omitted, all ["_own properties_"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
		 * present on the source at
		 * instantiation time will be exposed for read access through the proxy.
		 */
		getters?: Readonly<Array<keyof TSource>>,
		/**
		 * Keys that should definitely be omitted from read access,
		 * even if they are present in {@link getters}.
		 * @default [] - Empty array.
		 */
		gettersExclude?: Readonly<Array<keyof TSource>>,
		/**
		 * The keys to be exposed for write access through the proxy.
		 * This defaults to an empty array, so if omitted, none of the gated
		 * properties will be writeable.
		 * @default [] - Empty array.
		 */
		setters?: Readonly<Array<keyof TSource> | true>,
		/**
		 * Keys that should definitely be omitted from write access,
		 * even if they are present in {@link setters}.
		 * @default [] - Empty array.
		 */
		settersExclude?: Readonly<Array<keyof TSource>>,
	}

	export type Params<TSource extends TRecord> = [
		/**
		 * The target object, where the actual values are stored.
		 * Keys on the created gate object will use JavaScript getters to return
		 * the real-time value of the same key from this source object.
		 */
		source: TSource,
		/** @see {@link IGateConfig} */
		config?: Readonly<IGateConfig<TSource>>,
	]

	export class Gate<TSource extends TRecord> {
		constructor(...params: Params<TSource>) {
			const [source, config] = params;

			const getters = config?.getters ?? (Reflect.ownKeys(source) as (keyof TSource)[]);
			const gettersExclude = config?.gettersExclude ?? [];

			const setters = config?.setters === true
				? getters
				: (config?.setters ?? [])
			;
			const settersExclude = config?.settersExclude ?? [];

			getters.forEach((_key) => {
				const key = _key as keyof TSource;

				if (gettersExclude.includes(key)) return;

				Object.defineProperty(this, key, {
					enumerable: true,
					configurable: true,
					get() {
						return source[key];
					},
				});
			});

			setters.forEach((_key) => {
				const key = _key as keyof TSource;

				if (settersExclude.includes(key)) return;

				Object.defineProperty(this, key, {
					enumerable: true,
					set(value) {
						source[key] = value;
					},
				});
			});
		}
	};

	type TMemberOf<TConfig extends IGateConfig<TRecord>, Key extends 'getters' | 'gettersExclude' | 'settersExclude'> = (
		TConfig[Key] extends undefined
			? []
			: NonNullable<TConfig[Key]>
	)[number];
	type TGetterKeys<TConfig extends IGateConfig<TRecord>> = Exclude<
		TMemberOf<TConfig, 'getters'>,
		TMemberOf<TConfig, 'gettersExclude'>
	>;
	export interface IConstructor {
		new <TOutput extends Partial<TSource>, TSource extends TRecord>(
			...params: _ObjectGate.Params<TSource>
		): TOutput;
	}
}

/**
 * Creates a new object that acts as a real-time proxy
 * for the {@link _ObjectGate.Params | `source`} object.
 * This lets you prevent access to some properties, effectively making them private,
 * while selectively exposing access to only the properties you specify
 * in the {@link _ObjectGate.IGateConfig.getters | `getters`} config option.
 *
 * The exposed properties are read-only by default,
 * exposing only a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#description)
 * with no corresponding [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set#description).
 *
 * The {@link _ObjectGate.Params | `config`} argument also lets you selectively allow
 * write access to specific properties through the
 * {@link _ObjectGate.IGateConfig.setters | `setters`} config option.
 *
 * Unlike [`structuredClone`](https://developer.mozilla.org/docs/Web/API/Window/structuredClone)
 * this doesn't return a _copy_ of the `source` object.
 *
 * Instead, it returns a _**Real-time proxy**_. This means that a value is read
 * from the source object each time a property is accessed through the proxy.
 * So accessing a property through the gate object is guaranteed to always return
 * the latest value.
 */
export const ObjectGate = _ObjectGate.Gate as _ObjectGate.IConstructor;
