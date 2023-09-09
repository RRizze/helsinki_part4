const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

app.listen(config.API_PORT, () => {
  logger.info(`Server running on port ${config.API_PORT}`);
});
