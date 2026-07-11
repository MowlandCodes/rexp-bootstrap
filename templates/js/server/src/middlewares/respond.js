export function respond(_req, res, next) {
  res.sendSuccess = function (data, message = "Success", statusCode = 200) {
    return this.status(statusCode).json({ status: "success", message, data });
  };
  res.sendError = function (message, statusCode = 500) {
    return this.status(statusCode).json({ status: "error", message, data: null });
  };
  next();
}
