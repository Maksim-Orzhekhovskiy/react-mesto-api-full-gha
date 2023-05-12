const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;
const UnauthorizedError = require("../errors/unauthorizedError");

function extractBearerToken(header) {
  return header.replace('Bearer ', '');
}

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError("Необходима авторизация3");
  }
  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key');
  } catch (err) {
    throw new UnauthorizedError("Необходима авторизация4");
  }

  req.user = payload;

  next();
};