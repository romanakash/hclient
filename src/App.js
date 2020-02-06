import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from 'emotion-theming';
import theme from '@rebass/preset';
import { Box, Flex, Button } from 'rebass';
import { Label, Input, Select, Textarea, Radio, Checkbox } from '@rebass/forms';
import firebase from 'firebase';
import axios from 'axios';
import FileUploader from 'react-firebase-file-uploader';

const config = {
	apiKey: process.env.REACT_APP_GCS_API_KEY,
	storageBucket: process.env.REACT_APP_GCS_STORAGE_BUCKET
};

firebase.initializeApp(config);

const serverApi = axios.create({
	baseURL: 'https://created-2020-server.herokuapp.com/api'
});
serverApi.defaults.headers.common['Authorization'] =
	process.env.REACT_APP_AUTH_TOKEN;

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
					setResumeLink(form_data.resumeLink);

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

	const [resumeLink, setResumeLink] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [file, setFile] = useState(null);

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
				setFile(file);
			} else {
				alert('File size should be smaller than 2mb');
			}
		}
	};

	const handleSubmit = async event => {
		event.preventDefault();

		if (!file) {
			alert('Upload you resume');
			return;
		}

		uploader.current.startUpload(file);

		const newFormData = Object.assign(
			{},
			formData,
			{ submitted: submitted },
			{
				resumeLink: resumeLink,
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
			<Box as="form" py={3} onSubmit={handleSubmit}>
				<Flex mx={-2} mb={3}>
					<Box width={1 / 2} px={2}>
						<Label htmlFor="field">Field</Label>
						<Input
							id="field"
							name="field"
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
				<Box px={2} ml="auto">
					<Label>
						{isUploading && (
							<p>Progress: {uploadProgress + '\n'}</p>
						)}
						{resumeLink !== '' && (
							<p>
								File uploaded sucessfully, Choose file again to
								reupload
							</p>
						)}
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
			</Box>
		</ThemeProvider>
	);
}

export default App;
