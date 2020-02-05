const express = require('express');

const app = express();
const port = process.env.PORT;
const path = require('path');

app.use(express.static(path.join(__dirname, '/build')));

app.get('/form', (req, res) => {
	res.sendFile(path.join(__dirname + '/client/public/index.html'));
});

app.listen(port, (req, res) => {
	console.log(`server listening on port: ${port}`);
});
