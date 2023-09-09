const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blog');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/user');
// login
const mongoose = require('mongoose');

const connectOptions = { authSource: 'admin' };
mongoose.connect(config.MONGODB_URI, connectOptions)
  .then(res => {
    logger.info('connection successfull');
  })
  .catch(err => {
    logger.error(err);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
