const { verifyJWT } = require("../helpers/utils");

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token
    
    if (!token) {
      return res.status(401).send({ message: "No token provided. Access denied." });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return res.status(401).send({ message: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "Token verification failed." });
  }
};

// Optional token verification (for public endpoints that can also use auth)
const optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
};
