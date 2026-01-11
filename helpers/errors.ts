/**
 * Throw an error with the provided message
 * only when `NODE_ENV` is *not* 'production'.
 * 
 * In production, this falls back to just a console warning.
 * 
 * Useful for enforcing certain conditions in development
 * while failing more gracefully in production.
 */
export const throwDevError = (message: string) => {
	if (process.env.NODE_ENV === 'production') {
		console.warn(message);
	} else {
		throw new Error(message);
	}
}
