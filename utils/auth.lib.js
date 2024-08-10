const jwt = require("jsonwebtoken");

const User = require("../src/models/user.model");

const JWT_SECRET = process.env.JWT_SECRET;

const getToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET);
};

const verifyToken = async (token) => {
  try {
    const decrypt = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decrypt.id);
    return user;
  } catch (err) {
    return null;
  }
};

module.exports = {
  getToken,
  verifyToken,
};
