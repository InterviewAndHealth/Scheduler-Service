const { customAlphabet } = require("nanoid");
const EventTypes = require("./types");
const SchedulerService = require("../scheduler");
const { Logger } = require("../../utils");

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

class IncomingEventService {
  static async handleEvent(event) {
    Logger.info("Received incoming event", event);

    if (!event.data.id) {
      event.data.id = nanoid();
    }

    switch (event.type) {
      case EventTypes.SCHEDULE_EVENT:
        await IncomingEventService.handleScheduledEvent(event.data);
        break;
      case EventTypes.CHANGE_KEY:
        await IncomingEventService.handleChangeKey(event.data);
        break;
      default:
        Logger.error("Unknown event type", event);
    }
  }

  static async handleScheduledEvent(data) {
    if (!data.seconds || !data.service || !data.type || !data.data) {
      Logger.error("Invalid event", data);
      return;
    }

    const key = `${data.service}:${data.type}:${data.id}`;

    const value = {
      event: EventTypes.SCHEDULE_EVENT,
      service: data.service,
      type: data.type,
      data: data.data,
    };

    await SchedulerService.schedule(key, value, data.seconds);
  }

  static async handleChangeKey(data) {
    if (!data.key || !data.value || !data.seconds) {
      Logger.error("Invalid event", data);
      return;
    }

    const key = `${data.key}:${data.id}`;

    const value = {
      event: EventTypes.CHANGE_KEY,
      key: data.key,
      value: data.value,
      ttl: data.ttl || -1,
      isJson: data.isJson || false,
    };

    await SchedulerService.schedule(key, value, data.seconds);
  }
}

module.exports = IncomingEventService;
