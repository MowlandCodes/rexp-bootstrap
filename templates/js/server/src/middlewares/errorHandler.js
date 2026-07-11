import { AppError } from "@/errors";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.sendError(err.message, err.statusCode);
    return;
  }

  console.error(err);
  res.sendError("Internal Server Error", 500);
}
