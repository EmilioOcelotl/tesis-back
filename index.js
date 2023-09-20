const express = require('express');
const router = require('./routes');
// https://stackoverflow.com/questions/58090447/expressjs-and-pdfkit-generate-a-pdf-in-memory-and-send-to-client-for-download

const app = express();
app.use(express.json());
app.use(router);

app.listen(8081, () => console.log('server running on port 8081'));
