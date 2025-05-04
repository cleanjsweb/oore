
export const canIndex = <T extends object>(key: keyof any, targetObject: T): key is keyof T => {
	const test = typeof key === 'number' ? `${key}` : key;
	return Reflect.ownKeys(targetObject).includes(test);
};
