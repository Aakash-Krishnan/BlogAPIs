const { verifyToken } = require("../../utils/auth.lib");

const { roles, USER } = require("../../utils/constants");

const verifyAuth = async (req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "Authorization token is required",
    });
  }

  const user = await verifyToken(token);

  if (!user) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  req.user = user;

  next();
};

const restrictToRole = (requiredRole = USER) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (roles[userRole] < roles[requiredRole]) {
      return res.status(403).json({
        error: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = { verifyAuth, restrictToRole };
