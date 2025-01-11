const RedisService = require("./services/redis");
const SchedulerService = require("./services/scheduler");
const { Broker, EventService } = require("./services/broker");
const { IncomingEventService } = require("./services/events");
const { Logger } = require("./utils");
const { SERVICE_QUEUE } = require("./config");

async function main() {
  Logger.initialize(Logger.levels.INFO);
  await await EventService.subscribe(SERVICE_QUEUE, IncomingEventService);

  await RedisService.initialize();
  SchedulerService.start();
}

main()
  .then(() => {
    Logger.info("Scheduler started");
  })
  .catch((err) => {
    Logger.error("Failed to start scheduler", err);
    process.exit(1);
  })
  .finally(() => {
    process.on("SIGINT", async () => {
      await Broker.close();
      process.exit(0);
    });
  });
