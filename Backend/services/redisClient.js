const { createClient } = require("redis");

let client = null;
let connectPromise = null;

const buildRedisClient = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required");
  }

  return createClient({
    url: process.env.REDIS_URL,
  });
};

const getRedisClient = async () => {
  if (client?.isOpen) {
    return client;
  }

  if (!client) {
    client = buildRedisClient();
    client.on("error", (err) => {
      console.error("Redis error:", err.message);
    });
  }

  if (!connectPromise) {
    connectPromise = client.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;
  return client;
};

module.exports = {
  getRedisClient,
};
