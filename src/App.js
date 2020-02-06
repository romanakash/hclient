import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import theme from '@rebass/preset';
import { Box, Flex, Button, Link } from 'rebass';
import { Label, Input, Select, Textarea, Radio, Checkbox } from '@rebass/forms';
import axios from 'axios';

import './App.css';

const serverApi = axios.create({
	baseURL: 'https://created-2020-server.herokuapp.com/api'
});

function App() {
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const accessToken = urlParams.get('access_token');

		if (accessToken) {
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
					const { mlh_data, form_data } = res.data;
					setMLHData(mlh_data);
					setFormData(form_data);
					setSubmitted(form_data.submitted);

					setFieldDefault(form_data.field);
				} else {
					console.log('Error connecting to mlh');
				}
			});
		}
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

	const urlParams = new URLSearchParams(window.location.search);
	const accessToken = urlParams.get('access_token');
	if (!accessToken) {
		return <div>Error Not Authorised - Go away!</div>;
	}

	return (
		<ThemeProvider theme={theme}>
			<Box as="form" py={3}   onSubmit={handleSubmit}>
				<Flex mx={-2}>
					<Box width={1 / 4} px={3} py={3}>
						<Label htmlFor="firstName">First Name</Label>
						<Input
							id="firstName"
							name="firstName"
							defaultValue={fieldDefault}
						/>
					</Box>
					<Box width={1 / 4} px={2} py={3}>
						<Label htmlFor="lastName">Last Name</Label>
						<Input
							id="lastName"
							name="lastName"
							defaultValue={fieldDefault}
						/>
					</Box>
					</Flex>
				<Flex mx={-2} >
					<Box width={1/4} px={3} py={3}>
						<Label htmlFor="phoneNumber">Phone Number</Label>
						<Input
							id="phoneNumber"
							name="phoneNumber"
							defaultValue={fieldDefault}
						/>
					</Box>	
					<Box width={1/4} px={3} py={3}>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							defaultValue={fieldDefault}
						/>
					</Box>			
				</Flex>
				<Flex mx={-2}>
					<Box width={1/4} px={3} py={3}>
						<Label htmlFor="university">University</Label>
						<Input
							id="university"
							name="university"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
					<Box width={2/5} px={3} py={3}>
						<Label htmlFor="cv">Link your cv/resume</Label>
						<Input
							id="cv"
							name="cv"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
					<Box width={1} px={3} py={3}>
						<Label htmlFor="dietary">Do you have any specific dietary requirements?</Label>
						<Input 
							id="dietary"
							name="dietary"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
					<Box width={1} px={3} py={3}>
						<Label htmlFor="major">What are you studying?</Label>
						<Input 
							id="major"
							name="major"
							defaultValue={fieldDefault}
						/>
					</Box>
					<Box width={1} px={3} py={3}>
						<Label htmlFor="level">Current level of study</Label>
						<Select 
							id="level"
							name="level"
							defaultValue={fieldDefault}>
							<option>Undergraduate</option>
							<option>Postgraduate</option>
							<option>PhD</option>

						</Select>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
						<Label htmlFor="why">Why do you want to attend CreatED '20? (max. 200)</Label>
						<Textarea 
							id="why"
							name="why"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
						<Label htmlFor="project">Tell us about your favourite project. (max. 200)</Label>
						<Textarea 
							id="project"
							name="project"
							defaultValue={fieldDefault}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
						<Label>
						<Checkbox 
							id="mlhCodeAgree"
							name="mlhCodeAgree"
							
						/>
						<p>I have read and agree to the <Link href='https://static.mlh.io/docs/mlh-code-of-conduct.pdf'> MLH Code of Conduct</Link></p>
						</Label>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
					<Label>
						<Checkbox 
							id="mlhPrivacy"
							name="mlhPrivacy"
							defaultValue={fieldDefault}
						/>
						<p htmlFor="mlhPrivacy">I authorise you to share my application information for event administration, ranking, MLH administration, pre- and post-event informational e-mails, and occasional messages about hackathons in-line with the <Link href='https://mlh.io/privacy'>MLH Privacy Policy</Link>. I further agree to the terms of both the MLH Contest Terms and Conditions and the MLH Privacy Policy</p>
					</Label>
					</Box>
				</Flex>

				<Box px={2} py={2} ml="auto">
					<Button px={2} mx={2} type="submit" variant={'primary'}>
						Save
					</Button>
					<Button 
						px={2}
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
