module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = statusCode === 500 ? `Произошла неизвестная ошибка ${err.name}: ${err.message}` : err.message;
  res.status(statusCode).send({
    message: errorMessage,
  });
  return next();
};
