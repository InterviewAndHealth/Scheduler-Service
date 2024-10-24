const RedisService = require("./redis");
const OutgoingEventService = require("./events/outgoing");

class NameSpace {
  static _SCHEDULER = "scheduler";

  static KEYS = `${NameSpace._SCHEDULER}:keys`;
  static DATA = `${NameSpace._SCHEDULER}:data`;
  static LOCK = `${NameSpace._SCHEDULER}:lock`;
}

const KEYSPACE_PREFIX = "__keyspace@0__";
const LOCK_TTL = 5000;

class SchedulerService {
  static async start() {
    await RedisService.subClient.pSubscribe(
      `${KEYSPACE_PREFIX}:${NameSpace.KEYS}:*`,
      async (message, channel) => {
        if (message !== "expired") return;

        const affectedKey = channel.substring(
          `${KEYSPACE_PREFIX}:${NameSpace.KEYS}:`.length
        );

        const lockKey = `${NameSpace.LOCK}:${affectedKey}`;
        const lockAcquired = await RedisService.client.set(lockKey, "locked", {
          NX: true,
          PX: LOCK_TTL,
        });

        if (lockAcquired) {
          try {
            const value = await RedisService.client.json.get(
              `${NameSpace.DATA}:${affectedKey}`
            );

            await OutgoingEventService.handleEvent(value);

            await RedisService.client.del(`${NameSpace.DATA}:${affectedKey}`);
          } finally {
            await RedisService.client.del(lockKey);
          }
        }
      }
    );
  }

  static async schedule(key, value, ttl) {
    await RedisService.client.json.set(`${NameSpace.DATA}:${key}`, ".", value);
    await RedisService.client.setEx(`${NameSpace.KEYS}:${key}`, ttl, "");
  }
}

module.exports = SchedulerService;
