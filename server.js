require('dotenv').load();
const http = require('http');
const express = require('express');
const routes = require('./routes');

const app = express();

app.use('/', routes);

app.use((err, req, res, next) => (
  res.status(500).json({ message: 'There was an error' })
));

const port = Number(process.env.PORT);

http.createServer(app).listen(port, () => {
  console.log(`Listening at port ${port}`);
});
