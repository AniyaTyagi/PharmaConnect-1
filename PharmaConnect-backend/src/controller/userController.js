const User = require("../models/Users");
const { redisClient } = require("../config/redis");

exports.getUser = async (req, res) => {
  const { id } = req.params;

  const cacheKey = `user:${id}`;

  // 1. Check Redis
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // 2. Fetch from MongoDB
  const user = await User.findById(id);

  // 3. Store in Redis
  await redisClient.set(cacheKey, JSON.stringify(user), {
    EX: 60
  });

  res.json(user);
};