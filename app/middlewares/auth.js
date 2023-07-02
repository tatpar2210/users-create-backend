const jwt = require("jsonwebtoken");
const config = require("../config/db.config");
exports.verifyAuth = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token)
    return res
      .status(401)
      .send({ auth: false, message: "Authentication failed." });

  jwt.verify(token, config.secret_token, (err, decoded) => {
    if (err)
      return res.status(401).send({
        auth: false,
        message: "Invalid Token.",
        data: err,
      });
      req.email = decoded.email
    return next();
  });
};
