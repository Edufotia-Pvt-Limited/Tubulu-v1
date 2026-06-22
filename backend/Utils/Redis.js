const Redis = require('ioredis');
const { config } = require('../config');

const redis = new Redis({
    host: config.REDIS.host,
    port: config.REDIS.port,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('connect', () => {
    console.log('Connected to Redis successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
