const { createClient } = require("redis");
const { REDIS_URL } = require("../config");

class RedisService {
  static client;
  static subClient;

  static async initialize() {
    const _client = createClient({ url: REDIS_URL });
    await _client.connect();

    const _subClient = _client.duplicate();
    await _subClient.connect();

    RedisService.client = _client;
    RedisService.subClient = _subClient;
  }
}

module.exports = RedisService;
