# Scheduler Service

This service is responsible for scheduling the execution of the tasks. It can be used to schedule rabbitmq events or schedule changes in the redis cache. It uses the `SCHEDULER_QUEUE` rabbitmq queue to receive the events.

## Documentation

- To schedule rabbitmq events, the event should look like this:

```json
{
  "type": "SCHEDULE_EVENT",
  "data": {
    "id": "event-id",
    "seconds": 10,
    "service": "QUEUE_NAME",
    "type": "EVENT_TYPE",
    "data": { "key": "value" }
  }
}
```

1. `type` (Required) - The type of the event. It should be `SCHEDULE_EVENT`.
2. `data.id` (Optional) - The id of the event. If not provided, a random id will be generated. It can be used to reschedule the event. To reschedule the event, you need to send the same event with the same id.
3. `data.seconds` (Required) - The number of seconds to wait before sending the event to the queue.
4. `data.service` (Required) - The name of the queue where the event should be sent.
5. `data.type` (Required) - The type of the event that should be sent to the queue.
6. `data.data` (Required) - The data that should be sent to the queue.

- To schedule changes in the redis cache, the event should look like this:

```json
{
  "type": "CHANGE_KEY",
  "data": {
    "id": "event-id",
    "seconds": 10,
    "key": "key",
    "value": "value",
    "ttl": 10,
    "isJson": true
  }
}
```

1. `type` (Required) - The type of the event. It should be `CHANGE_KEY`.
2. `data.id` (Optional) - The id of the event. If not provided, a random id will be generated. It can be used to reschedule the event. To reschedule the event, you need to send the same event with the same id.
3. `data.seconds` (Required) - The number of seconds to wait before changing the key in the redis cache.
4. `data.key` (Required) - The key that should be changed in the redis cache.
5. `data.value` (Required) - The value that should be set in the redis cache.
6. `data.ttl` (Optional) - The time to live of the key in the redis cache. If not provided, the key will not expire.
7. `data.isJson` (Optional) - If the value is a json object, it should be set to `true`.
