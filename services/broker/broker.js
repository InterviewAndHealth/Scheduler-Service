const amqplib = require("amqplib");
const { RABBITMQ_URL, EXCHANGE_NAME } = require("../../config");
const { Logger } = require("../../utils");

class Broker {
  static #channel;
  static #exchange;

  /**
   * Connect to RabbitMQ
   * @returns {Promise} - A promise that resolves to a RabbitMQ channel
   * @throws {Error} - If RabbitMQ connection fails
   */
  static async connect() {
    try {
      if (this.#channel) return this.#channel;
      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      this.#channel = channel;
      Logger.info("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      Logger.error("Failed to connect to RabbitMQ", err);
    }
  }

  /**
   * Create a RabbitMQ exchange and channel
   * @returns {Promise} - A promise that resolves to a RabbitMQ exchange
   * @throws {Error} - If RabbitMQ queue creation fails
   */
  static async channel() {
    try {
      if (this.#exchange) return this.#exchange;
      const channel = await this.connect();
      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      this.#exchange = channel;
      Logger.info("Created RabbitMQ exchange");
      return channel;
    } catch (err) {
      Logger.error("Failed to create RabbitMQ channel", err);
    }
  }
}

module.exports = Broker;
