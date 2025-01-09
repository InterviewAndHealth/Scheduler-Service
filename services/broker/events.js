const { EXCHANGE_NAME, SERVICE_QUEUE } = require("../../config");
const Broker = require("./broker");
const { Logger } = require("../../utils");

class EventService {
  /**
   * Publish an event to RabbitMQ queue
   * @param {string} service - The service name to publish the event to
   * @param {object} data - The event data
   * @returns {Promise} - A promise that resolves when the event is published
   * @throws {Error} - If event publishing fails
   * @example
   * Events.publish('INTERVIEW_SERVICE', {
   *    type: 'INTERVIEW_SCHEDULED',
   *    data: {
   *        interviewId: 1,
   *        candidateId: 1,
   *    }
   * });
   */
  static async publish(service, data) {
    try {
      const channel = await Broker.channel();
      channel.publish(
        EXCHANGE_NAME,
        service,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
      );
    } catch (err) {
      Logger.error("Failed to publish event", err);
    }
  }

  /**
   * Subscribe to events from a service
   * @param {string} service - The service name to subscribe to
   * @param {function} subscriber - Service to receive events with function `handleEvent` to handle events
   * @returns {Promise} - A promise that resolves when the subscription is successful
   * @throws {Error} - If event subscription fails
   * @example
   * Events.subscribe('INTERVIEW_SERVICE', Service);
   */
  static async subscribe(service, subscriber) {
    try {
      const channel = await Broker.connect();
      const queue = await channel.assertQueue(SERVICE_QUEUE, {
        durable: true,
        arguments: {
          "x-queue-type": "quorum",
        },
      });
      channel.bindQueue(queue.queue, EXCHANGE_NAME, service);
      channel.consume(
        queue.queue,
        async (data) => {
          if (data.content) {
            try {
              const message = JSON.parse(data.content.toString());
              await subscriber.handleEvent(message); // Await the async function
              channel.ack(data); // Acknowledge after successful processing
            } catch (err) {
              Logger.error("Error handling event", err);
              channel.nack(data); // Re-queue the message on failure
            }
          }
        },
        { noAck: false }
      );
    } catch (err) {
      Logger.error("Failed to subscribe to service", err);
    }
  }
}

module.exports = EventService;
