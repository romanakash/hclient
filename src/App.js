import React, { useEffect } from 'react';
import { ThemeProvider } from 'emotion-theming';
import theme from '@rebass/preset';
import { Box, Flex, Button } from 'rebass';
import { Label, Input, Select, Textarea, Radio, Checkbox } from '@rebass/forms';

import './App.css';

function App() {
	useEffect(() => {});

	const handleSubmit = event => {
		event.preventDefault();
		const formData = {
			field: event.target[0].value
		};
		const userData = { formData };

		console.log(userData);
	};

	return (
		<ThemeProvider theme={theme}>
			<Box as="form" py={3} onSubmit={handleSubmit}>
				<Flex mx={-2} mb={3}>
					<Box width={1 / 2} px={2}>
						<Label htmlFor="field">Field</Label>
						<Input
							id="field"
							name="field"
							defaultValue="Jane Doe"
						/>
					</Box>
				</Flex>
				<Box px={2} ml="auto">
					<Button type="submit" variant={'primary'}>
						Submit
					</Button>
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default App;
