const amqp = require("amqp-connection-manager");
const { RABBITMQ_URL } = require("../../config");
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
      const connection = amqp.connect([RABBITMQ_URL]);

      connection.on("connect", () => {
        Logger.info("Connected to RabbitMQ");
      });
      connection.on("disconnect", (err) =>
        Logger.error("Disconnected from RabbitMQ", err)
      );
      connection.on("blocked", (reason) =>
        Logger.warning("RabbitMQ connection blocked", reason)
      );
      connection.on("unblocked", () =>
        Logger.info("RabbitMQ connection unblocked")
      );

      this.#connection = connection;
      return connection;
    } catch (err) {
      Logger.error("Failed to connect to RabbitMQ", err);
    }
  }

  /**
   * Close RabbitMQ connection
   */
  static async close() {
    Logger.info("Closing RabbitMQ connection");
    if (this.#connection) {
      await this.#connection.close();
      this.#connection = null;
    }
  }
}

module.exports = Broker;
