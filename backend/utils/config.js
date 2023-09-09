require('dotenv').config();

const API_PORT = process.env.API_PORT;

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI;

module.exports = {
  API_PORT,
  MONGODB_URI,
};
