import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import theme from '@rebass/preset';
import { Box, Flex, Button } from 'rebass';
import { Label, Input, Select, Textarea, Radio, Checkbox } from '@rebass/forms';
import axios from 'axios';

import './App.css';

const serverApi = axios.create({
	baseURL: 'http://localhost:8080/api/'
});

function App() {
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const accessToken = urlParams.get('access_token');

		async function getMLHId() {
			try {
				return await serverApi.get('authorise', {
					params: {
						access_token: accessToken
					}
				});
			} catch (e) {
				console.log(e);
			}
		}
		getMLHId().then(res => {
			if (res.data.status === 'OK') {
				console.log('changes');
				const { mlh_data, form_data } = res.data;
				setMLHData(mlh_data);
				setFormData(form_data);
				setSubmitted(form_data.submitted);

				setFieldDefault(form_data.field);
			} else {
				console.log('Error connecting to mlh');
			}
		});
	}, []);

	const [mlhData, setMLHData] = useState({});
	const [formData, setFormData] = useState({});
	const [submitted, setSubmitted] = useState(false);

	const [fieldDefault, setFieldDefault] = useState('');

	const handleSubmit = async event => {
		event.preventDefault();
		const newFormData = Object.assign(
			{},
			formData,
			{ submitted: submitted },
			{
				field: event.target[0].value
			}
		);
		const userData = { mlh_data: mlhData, form_data: newFormData };
		console.log(userData);

		try {
			await serverApi.post('submit-form', {
				data: userData
			});
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box as="form" py={3} onSubmit={handleSubmit}>
				<Flex mx={-2}>
					<Box width={1 / 3} px={3}>
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							name="firstName"
							defaultValue={fieldDefault}
						/>
					</Box>
					<Box width={1 / 3} px={2}>
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							name="lastName"
							defaultValue={fieldDefault}
						/>
					</Box>
					</Flex>
				<Flex mx={-2} >
					<Box width={1/3} px={3}>
						<Label htmlFor="phoneNumber">Phone Number</Label>
						<Input
							id="phoneNumber"
							name="phoneNumber"
							defaultValue={fieldDefault}
						/>
					</Box>				
				</Flex>
				<Flex mx={-2}>
					<Box width={1/3} px={3}>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
					<Box width={1/3} px={3} py={2}>
						<Label htmlFor="university">University</Label>
						<Input
							id="university"
							name="university"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				
				<Box px={2} ml="auto">
					<Button type="submit" variant={'primary'}>
						Save
					</Button>
					<Button
						type="submit"
						onClick={() => setSubmitted(true)}
						variant={'primary'}
					>
						Submit
					</Button>
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default App;
