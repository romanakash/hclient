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

					setFormDefault(form_data);
					
				} else {
					console.log('Error connecting to mlh');
				}
			});
		}
	}, []);

	const [mlhData, setMLHData] = useState({});
	const [formData, setFormData] = useState({});
	const [submitted, setSubmitted] = useState(false);

	const [formDefault, setFormDefault] = useState({dietaryRestrictions: '', why:'', project:'', isFirstTime: false, sleepingArrangements: false});
	const [isSleepingArrangements, setIsSleepingArrangements] = useState(false);
	const [isFirstTime, setIsFirstTime] = useState(false);
	const [acceptCodeOfConduct, setAcceptCodeOfConduct ] = useState(false);
	const [acceptMlhPrivacy, setAcceptMlhPrivacy] = useState(false);
	const [acceptSharing, setAcceptSharing] = useState(false);

	const handleSubmit = async event => {
		event.preventDefault();
		console.log(event.target[3]);
		const newFormData = Object.assign(
			{},
			formData,
			{ submitted: submitted },
			{
				dietaryRestrictions: event.target[0].value,
				why: event.target[1].value,
				project: event.target[2].value,
				isFirstTime: event.target[3].value === 'true'? true : false,
				sleepingArrangements: event.target[4].value === 'true'? true : false

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
			<h1 align='center'>CreatED 2020 Application Form</h1>
			<Box as="form" py={3}  onSubmit={handleSubmit}>

				<Flex mx={-2}>
					<Box width={1/2} px={3} py={3}>
						<Label htmlFor="dietaryRestrictions">Do you have any specific dietary requirements?</Label>
						<Input 
							id="dietary"
							name="dietary"
							defaultValue={formDefault.dietaryRestrictions}
						/>
					</Box>
				</Flex>

				<Flex mx={-2}>
				<Box width={1/2} px={3} py={3} >
						<Label htmlFor="why">Why do you want to attend CreatED '20? (max. 200 words)</Label>
						<Textarea 
							id="why"
							name="why"
							defaultValue={formDefault.why}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1/2} px={3} py={3} >
						<Label htmlFor="project">Tell us about your favourite project. (max. 200 words)</Label>
						<Textarea 
							id="project"
							name="project"
							defaultValue={formDefault.project}
						/>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1/4} px={3} py={3} >
						<Label>
						< Checkbox 
							id="sleepingArrangements"
							name="sleepingArrangements"
							value={isSleepingArrangements}
							onChange={() =>  setIsSleepingArrangements(!isSleepingArrangements)}
														
						/>
						
						Do you need sleeping arrangments overnight?
						</Label>
					</Box>
					<Box width={1/4} px={3} py={3} >
						<Label>
						< Checkbox				
							id="isFirstTime"
							name="isFirstTime"
							value={isFirstTime}
							onChange={() => setIsFirstTime(!isFirstTime)}
						/>
						Is this your first time attending a hackathon?
						</Label>
					</Box>
				</Flex>

				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
						<Label>
						<Checkbox 
							
							id="acceptSharing"
							name="acceptSharing"
							value={acceptSharing}
							onChange={() => setAcceptSharing(!acceptSharing)}
							
						/>
						Do you consent to us sharing your resume/cv with our sponsors? (required)
						</Label>
					</Box>
				</Flex>

				<Flex mx={-2}>
				<Box width={1} px={3} py={3} >
						<Label>
							<Checkbox 
							mt="50%"
							id="acceptCodeOfConduct"
							name="acceptCodeOfConduct"
							value={acceptCodeOfConduct}
							onChange={() => setAcceptCodeOfConduct(!acceptCodeOfConduct)}
							
						/>
						<p  mt="50%" mx={3}>I have read and agree to the <Link href='https://static.mlh.io/docs/mlh-code-of-conduct.pdf'> MLH Code of Conduct</Link></p>
						</Label>
					</Box>
				</Flex>
				<Flex mx={-2}>
				<Box width={1/2} px={3} py={3} >
					<Label>
						<Checkbox 
							mt='50%'
							mr={5}
							id="acceptMlhPrivacy"
							name="acceptMlhPrivacy"
							value = {acceptMlhPrivacy}
							onChange={() => setAcceptMlhPrivacy(!acceptMlhPrivacy)}

						/>
						<p all='unset' mt="50%" >I authorise you to share my application information for event administration, ranking, MLH administration, pre- and post-event informational e-mails, and occasional messages about hackathons in-line with the <Link href='https://mlh.io/privacy'>MLH Privacy Policy</Link>. I further agree to the terms of both the <Link href='https://github.com/MLH/mlh-policies/tree/master/prize-terms-and-conditions'>MLH Contest Terms and Conditions</Link> and the <Link href='https://mlh.io/privacy'>MLH Privacy Policy</Link></p>
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
