// server/server.js
// Entry point cho backend và phục vụ frontend tĩnh từ client/

const express = require('express');
const path = require('path');
const pagesRouter = require('./Routes/pages');
const apiRouter = require('./Routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'wwwroot')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRouter);
app.use('/', pagesRouter);

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
