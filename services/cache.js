const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const redisClient = redis.createClient(redisUrl);
redisClient.hget = util.promisify(redisClient.hget);

/* Monkey-patch the mongoose library to allow easy caching of mongoose queries
with Redis */

// Inject extra logic into mongoose exec function
const exec = mongoose.Query.prototype.exec;

/**
 * @param {*} [options={key: string | number}]
 * @return {*}
 */
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || 'default');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  // If the 'useCache' flag has not been set, use the vanilla mongoose exec
  // function
  if (!this.useCache) return exec.apply(this, arguments);

  // To create a unique key, combine the stringified query with the collection
  // name
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // Check if value exists for key in Redis. If so, return it
  const cacheValue = await redisClient.hget(this.hashKey, key);
  if (cacheValue) {
    const parsedValue = JSON.parse(cacheValue);

    // If the parsed value is a single object, create a mongoose model from it
    // and return it - if the value is an array of objects, map models to a new
    // array
    return Array.isArray(parsedValue)
      ? parsedValue.map((d) => new this.model(d))
      : new this.model(parsedValue);
  }

  // Otherwise, issue the query and store the result in redis, then return the
  // result
  const queryResult = await exec.apply(this, arguments);
  redisClient.hset(this.hashKey, key, JSON.stringify(queryResult), 'EX', 10);
  return queryResult;
};

module.exports = {
  clearCache(hashKey) {
    redisClient.del(JSON.stringify(hashKey));
  },
};
