const { EventService } = require("../broker");
const EventTypes = require("./types");
const { Logger } = require("../../utils");
const RedisService = require("../redis");

class OutgoingEventService {
  static async handleEvent(value) {
    Logger.info("Received outgoing event", value);

    switch (value.event) {
      case EventTypes.SCHEDULE_EVENT:
        await OutgoingEventService.handleScheduledEvent(value);
        break;
      case EventTypes.CHANGE_KEY:
        await OutgoingEventService.handleChangeKey(value);
        break;
      default:
        Logger.error("Unknown event type", event);
    }
  }

  static async handleScheduledEvent(value) {
    if (!value.service || !value.type || !value.data) {
      Logger.error("Invalid scheduled event", value);
      return;
    }

    EventService.publish(value.service, {
      type: value.type,
      data: value.data,
    });
  }

  static async handleChangeKey(value) {
    if (!value.key || !value.value) {
      Logger.error("Invalid change key event", value);
      return;
    }

    try {
      if (value.isJson) {
        await RedisService.client.json.set(value.key, ".", value.value);
      } else {
        await RedisService.client.set(value.key, value.value);
      }

      if (value.ttl > 0) {
        await RedisService.client.expire(value.key, value.ttl);
      }
    } catch (error) {
      Logger.error("Failed to set key", value, error);
    }
  }
}

module.exports = OutgoingEventService;
