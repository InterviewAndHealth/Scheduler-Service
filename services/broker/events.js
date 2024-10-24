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
        Buffer.from(JSON.stringify(data))
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
      const channel = await Broker.channel();
      const queue = await channel.assertQueue(SERVICE_QUEUE);
      channel.bindQueue(queue.queue, EXCHANGE_NAME, service);
      channel.consume(
        queue.queue,
        (data) => {
          if (data.content) {
            const message = JSON.parse(data.content.toString());
            subscriber.handleEvent(message);
          }
        },
        { noAck: true }
      );
    } catch (err) {
      Logger.error("Failed to subscribe to service", err);
    }
  }
}

module.exports = EventService;
