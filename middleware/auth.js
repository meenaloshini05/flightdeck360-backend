const jwt = require("jsonwebtoken");
const SECRET = "jwtkey"; // fixed key as requested

function auth(role = null) {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
      const decoded = jwt.verify(token.split(" ")[1], SECRET);
      req.user = decoded;
      if (role && decoded.role !== role) {
        return res.status(403).json({ msg: "Forbidden" });
      }
      next();
    } catch (err) {
      res.status(400).json({ msg: "Invalid token" });
    }
  };
}

module.exports = { auth, SECRET };
