import { useCallback, useEffect, useState } from 'react';

declare const Analytics: any;

const WelcomePage = () => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [jobTitle, setJobTitle] = useState('');
	const [country, setCountry] = useState('');
	const [address, setAddress] = useState('');

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		Analytics?.track('welcome_form_loaded');
	}, []);

	useEffect(() => {
		if (setErrorMessage) {
			setErrorMessage('');
		}
	}, [fullName, email, jobTitle, country, address]);

	const doSubmit = useCallback(() => {
		setIsSubmitting(true);

		fetch('/api/welcome', {
			method: 'POST',
			body: JSON.stringify({
				fullName,
				email,
				jobTitle,
				country,
				address,
			}),
		}).then(async (response) => {
			const body = await response.json();
			if (!body.success) setErrorMessage(body.error.mssage);
		}).catch((error) => {
			setErrorMessage(error.mssage);
		}).finally(() => {
			setIsSubmitting(false);
		});
	}, [fullName, email, jobTitle, country, address]);

	return (
		<form onSubmit={doSubmit}>
			<hgroup>
				<h2>Welcome, traveller.</h2>
				<p>Let's get to know you.</p>
			</hgroup>

			<label>
				Full name
				<input
					type="text"
					name="fullName"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
				/>
			</label>

			<label>
				Email address
				<input
					type="text"
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</label>

			<label>
				Job title
				<input
					type="text"
					name="jobTitle"
					value={jobTitle}
					onChange={(e) => setJobTitle(e.target.value)}
				/>
			</label>

			<label>
				Country
				<input
					type="text"
					name="country"
					value={country}
					onChange={(e) => setCountry(e.target.value)}
				/>
			</label>

			<label>
				Street address
				<input
					type="text"
					name="address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
				/>
			</label>

			<button type="submit">
				Submit
			</button>
		</form>
	);
};


export { WelcomePage };
