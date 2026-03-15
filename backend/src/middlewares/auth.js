const jwt = require("jsonwebtoken");
const { success } = require("zod");

const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;
  let token;

  if (bearer && bearer.startWith("Bearer")) {
    token = bearer.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token found!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error during Check token in middleware: ", error);
    return res.status(401).json({ message: "Not authorized, no token found!" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You Do not have permission!"
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
