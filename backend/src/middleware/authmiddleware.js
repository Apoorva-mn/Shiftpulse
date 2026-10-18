const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "FAILURE",
        message: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "FAILURE",
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Authenticated user:", decoded);

    req.user = decoded.data;

    next();

  } catch (error) {
    console.error(
      "Auth middleware error:",
      error.message
    );

    return res.status(401).json({
      status: "FAILURE",
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;