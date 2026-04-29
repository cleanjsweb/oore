import { useInstance } from '@/classy';
import { WelcomePageLogic } from './after-2';


const WelcomePageTemplate = () => {
	const self = useInstance(WelcomePageLogic, {});
	const { formValues } = self.hooks;

	return (
		<form onSubmit={self.submit}>
			<hgroup>
				<h2>Welcome, traveller.</h2>
				<p>Let's get to know you.</p>
			</hgroup>

			<label>
				Full name
				<input
					type="text"
					name="fullName"
					value={formValues.fullName}
					onChange={self.setValue}
				/>
			</label>

			<label>
				Email address
				<input
					type="text"
					name="email"
					value={formValues.email}
					onChange={self.setValue}
				/>
			</label>

			<label>
				Job title
				<input
					type="text"
					name="jobTitle"
					value={formValues.jobTitle}
					onChange={self.setValue}
				/>
			</label>

			<label>
				Country
				<input
					type="text"
					name="country"
					value={formValues.country}
					onChange={self.setValue}
				/>
			</label>

			<label>
				Street address
				<input
					type="text"
					name="address"
					value={formValues.address}
					onChange={self.setValue}
				/>
			</label>

			<button type="submit">
				Submit
			</button>
		</form>
	);
};


export { WelcomePageTemplate as WelcomePage };
