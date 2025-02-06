

// const redis = require('redis');

// let redisClient = null;

// const initRedisClient = async () => {
//   if (!redisClient) {
//     redisClient = redis.createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379', // Default to local if ENV is missing
//     });

//     redisClient.on('error', (err) => {
//       console.error('Redis Connection Error:', err);
//     });

//     try {
//       await redisClient.connect();
//       console.log('✅ Redis Client Connected Successfully!');
//     } catch (error) {
//       console.error('❌ Redis Connection Failed:', error);
//     }
//   }
//   return redisClient;
// };

// const getRedisClient = async () => {
//   if (!redisClient) await initRedisClient();
//   return redisClient;
// };

// module.exports = { initRedisClient, getRedisClient };






// const redis = require('redis');

// let redisClient = null;

// const initRedisClient = async () => {
//   if (!redisClient) {
//     redisClient = redis.createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379', // Default to local if ENV is missing
//     });

//     redisClient.on('error', (err) => {
//       console.error('Redis Connection Error:', err);
//     });

//     redisClient.on('connect', () => {
//       console.log('✅ Redis Client Connected Successfully!');
//     });

//     redisClient.on('end', () => {
//       console.log('❌ Redis Client Disconnected');
//     });

//     try {
//       await redisClient.connect();
//     } catch (error) {
//       console.error('❌ Redis Connection Failed:', error);
//     }
//   }
//   return redisClient;
// };

// const getRedisClient = async () => {
//   if (!redisClient) await initRedisClient();
//   return redisClient;
// };

// module.exports = { initRedisClient, getRedisClient };
