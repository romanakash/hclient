import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from 'emotion-theming';
import theme from '@rebass/preset';
import { Box, Flex, Button, Link, Text } from 'rebass';
import { Label, Input, Textarea, Checkbox } from '@rebass/forms';
import firebase from 'firebase';
import axios from 'axios';
import FileUploader from 'react-firebase-file-uploader';
require('dotenv').config();

const config = {
	apiKey: process.env.REACT_APP_GCS_API_KEY,
	storageBucket: process.env.REACT_APP_GCS_STORAGE_BUCKET
};

firebase.initializeApp(config);

const serverApi = axios.create({
	baseURL: 'https://created-2020-server.herokuapp.com/api'
});

serverApi.interceptors.request.use(config => {
	config.headers.auth = process.env.REACT_APP_AUTH_TOKEN;
	return config;
});

function App() {
	useEffect(() => {
		const hashurl = window.location.hash;

		let accessToken = hashurl.substring(
			hashurl.indexOf('#') + 1,
			hashurl.indexOf('&') !== -1 ? hashurl.indexOf('&') : hashurl.length
		);

		if (accessToken) {
			accessToken = accessToken.split('=')[1];
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
					setResumeLink(form_data.resumeLink);

					setFormDefault(form_data);
					setIsSaved(true);
				} else {
					console.log('Error connecting to mlh');
				}
			});
		}
	}, []);

	const [mlhData, setMLHData] = useState({});
	const [formData, setFormData] = useState({});
	const [submitted, setSubmitted] = useState(false);

	const [formDefault, setFormDefault] = useState({
		dietaryRestrictions: '',
		why: '',
		project: '',
		isFirstTime: false,
		sleepingArrangements: false
	});
	const [isSleepingArrangements, setIsSleepingArrangements] = useState(false);
	const [isFirstTime, setIsFirstTime] = useState(false);
	const [acceptCodeOfConduct, setAcceptCodeOfConduct] = useState(false);
	const [acceptMlhPrivacy, setAcceptMlhPrivacy] = useState(false);
	const [acceptSharing, setAcceptSharing] = useState(false);

	const [resumeLink, setResumeLink] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [file, setFile] = useState(null);
	const [choseFile, setChoseFile] = useState(false);

	const [isSaved, setIsSaved] = useState(false);

	const uploader = useRef(null);

	const handleUploadStart = () => {
		setIsUploading(true);
		setUploadProgress(0);
	};

	const handleProgress = progress => {
		setUploadProgress(progress);
	};

	const handleUploadSuccess = filename => {
		setResumeLink(filename);
	};

	const handleUploadError = error => {
		setIsUploading(false);
		console.log(error);
	};

	const handleChangeFile = e => {
		const file = e.target.files[0];
		if (file) {
			if (file.size <= 2097152) {
				setChoseFile(true);
				setFile(file);
			} else {
				alert('File size should be smaller than 2mb');
			}
		}
	};

	const handleSubmit = async event => {
		event.preventDefault();
		const dietaryRestrictions = event.target[0].value;
		const why = event.target[1].value;
		const project = event.target[2].value;
		const isSleepingArrangements = event.target[3].value;
		const isFirstTime = event.target[4].value;
		const acceptSharing = event.target[6].value;
		const acceptCodeOfConduct = event.target[7].value;
		const acceptMlhPrivacy = event.target[8].value;

		if (!why) {
			alert(
				'Please let us know why you would like to attend CreatED 2020'
			);
			return;
		}
		if (!project) {
			alert('Remember to let us know about you favourite project');
			return;
		}

		if (acceptSharing !== 'true') {
			alert(
				'Not submitted, we need to share your cv with our sponsors to keep them happy'
			);
			return;
		}

		if (acceptCodeOfConduct !== 'true') {
			alert('You must accept the MLH Code of Conduct to Submit!');
			return;
		}

		if (acceptMlhPrivacy !== 'true') {
			alert("Not submitted, you need to accept MLH's Privacy Policy");
			return;
		}

		if (!file && resumeLink.length === 0) {
			alert('Upload your resume');
			return;
		}

		if (choseFile) {
			uploader.current.startUpload(file);
			setChoseFile(false);
		}

		const newFormData = Object.assign(
			{},
			formData,
			{ submitted: submitted },
			{
				dietaryRestrictions,
				why,
				project,
				isFirstTime: isFirstTime === 'true' ? true : false,
				isSleepingArrangements:
					isSleepingArrangements === 'true' ? true : false,
				resumeLink
			}
		);
		const userData = { mlh_data: mlhData, form_data: newFormData };

		try {
			await serverApi.post('submit-form', {
				data: userData
			});
			setIsSaved(true);
		} catch (err) {
			console.log(err);
		}
	};

	const hashurl = window.location.hash;
	let accessToken = hashurl.substring(
		hashurl.indexOf('#') + 1,
		hashurl.indexOf('&') !== -1 ? hashurl.indexOf('&') : hashurl.length
	);
	if (accessToken) {
		accessToken = accessToken.split('=')[1];
	}
	if (!accessToken) {
		return <div>Error Not Authorised - Go away!</div>;
	}

	return (
		<ThemeProvider theme={theme}>
			<h1 align="center">CreatED 2020 Application Form</h1>
			{submitted && (
				<h3 align="center">
					Application submitted succesfully, you can edit and submit
					again
				</h3>
			)}
			{isSaved ? (
				<h4 align="center">Application saved</h4>
			) : (
				<h4 align="center">Recent changes not saved</h4>
			)}
			<Box
				as="form"
				onSubmit={handleSubmit}
				style={{ fontFamily: 'Helvetica', paddingTop: 20 }}
				onChange={() => setIsSaved(false)}
			>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Box width={1 / 2} py={3}>
						<Label htmlFor="dietaryRestrictions">
							Do you have any specific dietary requirements?
						</Label>
						<Input
							id="dietary"
							name="dietary"
							defaultValue={formDefault.dietaryRestrictions}
						/>
					</Box>
				</Flex>

				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 15
					}}
				>
					<Box width={1 / 2} py={3}>
						<Label htmlFor="why">
							Why do you want to attend CreatED '20? (max. 200
							words)
						</Label>
						<Textarea
							id="why"
							name="why"
							defaultValue={formDefault.why}
						/>
					</Box>
				</Flex>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 20
					}}
				>
					<Box width={1 / 2}>
						<Label htmlFor="project">
							Tell us about your favourite project. (max. 200
							words)
						</Label>
						<Textarea
							id="project"
							name="project"
							defaultValue={formDefault.project}
						/>
					</Box>
				</Flex>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 40
					}}
				>
					<Box
						width={1 / 2}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center'
						}}
					>
						<Label>
							<Checkbox
								id="sleepingArrangements"
								name="sleepingArrangements"
								value={isSleepingArrangements}
								onChange={() =>
									setIsSleepingArrangements(
										!isSleepingArrangements
									)
								}
							/>
							Do you need sleeping arrangements overnight?
						</Label>
					</Box>
					<Box
						width={1 / 2}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							paddingTop: 5
						}}
					>
						<Label>
							<Checkbox
								id="isFirstTime"
								name="isFirstTime"
								value={isFirstTime}
								onChange={() => setIsFirstTime(!isFirstTime)}
							/>
							Is this your first time attending a hackathon?
						</Label>
					</Box>
				</Flex>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 30
					}}
				>
					<Box width={1 / 2}>
						<Label>
							<Text pb={2}>
								{' '}
								Please upload a copy of your cv:
							</Text>
							{isUploading && (
								<p>Progress: {uploadProgress + '\n'}</p>
							)}
							{resumeLink.length !== 0 ? (
								<p>
									File uploaded sucessfully, Choose file again
									to reupload
								</p>
							) : null}
						</Label>
						<FileUploader
							ref={uploader}
							accept="application/pdf"
							id="resume"
							name="resume"
							randomizeFilename={true}
							storageRef={firebase.storage().ref('resumes')}
							onUploadStart={handleUploadStart}
							onUploadError={handleUploadError}
							onUploadSuccess={handleUploadSuccess}
							onChange={handleChangeFile}
							onProgress={handleProgress}
						/>
					</Box>
				</Flex>

				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 20
					}}
				>
					<Box
						width={1 / 2}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center'
						}}
					>
						<Label>
							<Checkbox
								id="acceptSharing"
								name="acceptSharing"
								value={acceptSharing}
								onChange={() =>
									setAcceptSharing(!acceptSharing)
								}
							/>
							Do you consent to us sharing your resume/cv with our
							sponsors? (required)
						</Label>
					</Box>
				</Flex>

				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 25
					}}
				>
					<Box
						width={1 / 2}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center'
						}}
					>
						<Label>
							<Checkbox
								id="acceptCodeOfConduct"
								name="acceptCodeOfConduct"
								value={acceptCodeOfConduct}
								onChange={() =>
									setAcceptCodeOfConduct(!acceptCodeOfConduct)
								}
							/>
							<Text>
								I have read and agree to the{' '}
								<Link href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf">
									{' '}
									MLH Code of Conduct
								</Link>
							</Text>
						</Label>
					</Box>
				</Flex>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Box
						width={1 / 2}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							paddingTop: 5
						}}
					>
						<Label>
							<Checkbox
								mr={5}
								id="acceptMlhPrivacy"
								name="acceptMlhPrivacy"
								value={acceptMlhPrivacy}
								onChange={() =>
									setAcceptMlhPrivacy(!acceptMlhPrivacy)
								}
							/>
							<Text>
								I authorise you to share my application
								information for event administration, ranking,
								MLH administration, pre- and post-event
								informational e-mails, and occasional messages
								about hackathons in-line with the{' '}
								<Link href="https://mlh.io/privacy">
									MLH Privacy Policy
								</Link>
								. I further agree to the terms of both the{' '}
								<Link href="https://github.com/MLH/mlh-policies/tree/master/prize-terms-and-conditions">
									MLH Contest Terms and Conditions
								</Link>{' '}
								and the{' '}
								<Link href="https://mlh.io/privacy">
									MLH Privacy Policy
								</Link>
							</Text>
						</Label>
					</Box>
				</Flex>
				<Flex
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingTop: 30
					}}
				>
					<Box>
						<Button type="submit" variant={'primary'} mr={5}>
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
				</Flex>
			</Box>
		</ThemeProvider>
	);
}

export default App;
