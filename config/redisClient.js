const redis = require('redis');

// Declare redisClient globally
let redisClient = null;

// Function to initialize Redis client
const initRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL // Load Redis URL from environment variables
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis!');
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect(); // Make sure it's connected before using
  }

  return redisClient;
};

// Export the init function and the client getter
module.exports = { initRedisClient, getRedisClient: async () => await initRedisClient() };
