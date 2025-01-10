const amqplib = require("amqplib");
const { RABBITMQ_URL, EXCHANGE_NAME } = require("../../config");
const { Logger } = require("../../utils");

class Broker {
  static #connection;

  /**
   * Connect to RabbitMQ
   * @returns {Promise} - A promise that resolves to a RabbitMQ connection
   * @throws {Error} - If RabbitMQ connection fails
   */
  static async connect() {
    try {
      if (this.#connection) return this.#connection;
      const connection = await amqplib.connect(RABBITMQ_URL);

      connection.on("error", (err) => {
        Logger.error("RabbitMQ connection error", err);
      });

      connection.on("close", () => {
        Logger.error("RabbitMQ connection closed");
        this.#connection = null;

        setTimeout(async () => {
          Logger.info("Reconnecting to RabbitMQ");
          await this.connect();
        }, 1000);
      });

      connection.on("blocked", (reason) => {
        Logger.error("RabbitMQ connection blocked", reason);
      });

      this.#connection = connection;
      Logger.info("Connected to RabbitMQ");
      return connection;
    } catch (err) {
      Logger.error("Failed to connect to RabbitMQ", err);
    }
  }

  /**
   * Create a RabbitMQ channel
   * @returns {Promise} - A promise that resolves to a RabbitMQ channel
   * @throws {Error} - If RabbitMQ channel creation fails
   */
  static async channel() {
    try {
      const connection = await this.connect();
      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      Logger.info("Created RabbitMQ channel");
      return channel;
    } catch (err) {
      Logger.error("Failed to create RabbitMQ channel", err);
    }
  }
}

module.exports = Broker;
