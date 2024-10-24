const dotEnv = require("dotenv");

dotEnv.config();

module.exports = {
  REDIS_URL: process.env.REDIS_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  SERVICE_NAME: process.env.SERVICE_NAME,
  SERVICE_QUEUE: process.env.SERVICE_QUEUE,
};
