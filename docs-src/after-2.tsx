import { useEffect, type ChangeEvent } from 'react';
import { ComponentInstance } from '@/classy';
import { useCleanState } from '@/base';


declare const Analytics: any;
type TInputName = keyof WelcomePageLogic['hooks']['formValues']['snapshot'];
type TProps = {
	x?: number,
	y?: number,
};


const initialFormValues = {
	fullName: '',
	email: '',
	jobTitle: '',
	country: '',
	address: '',
};

export class WelcomePageLogic extends ComponentInstance<TProps> {
	getInitialState = (props: TProps) => {
		const { x = 2, y = 1 } = props;

		return {
			submitting: false,
			errorMessage: '',
			z: x / y,
		};
	};

	useHooks = () => {
		const formValues = useCleanState(initialFormValues);

		useEffect(() => {
			if (this.state.errorMessage) {
				this.state.errorMessage = '';
			}
		}, Object.values(formValues));

		return {
			formValues,
		}
	};

	onMount = () => {
		Analytics?.track('welcome_form_loaded');
		return () => {};
	};

	submit = () => {
		this.state.submitting = true;

		fetch('/api/welcome', {
			method: 'POST',
			body: JSON.stringify(this.state.snapshot),
		}).then(async (response) => {
			const body = await response.json();
			if (!body.success) {
				// Set state with setter semantics.
				this.state.errorMessage = body.error.message;
			}
		}).catch((error) => {
			// Set state with method semantics.
			this.state.put.errorMessage(error.message);
		}).finally(() => {
			this.state.submitting = false;
		});
	};

	setValue = (event: ChangeEvent<HTMLInputElement>) => {
		const key = event.target.name as TInputName;
		this.hooks.formValues[key] = event.target.value;
	};

	resetForm = () => {
		this.hooks.formValues.putMany(initialFormValues);
	}
}
