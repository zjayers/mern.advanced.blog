const { clearCache } = require('../services/cache');

module.exports = async (req, res, next) => {
  // Wait for the route handler to complete, then run the middleware after
  await next();

  clearCache(req.user.id);
};
