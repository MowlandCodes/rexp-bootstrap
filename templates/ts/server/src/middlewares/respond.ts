import type { Request, Response, NextFunction } from "express";

export function respond(_req: Request, res: Response, next: NextFunction) {
  res.sendSuccess = function <T>(data: T, message = "Success", statusCode = 200) {
    return this.status(statusCode).json({ status: "success", message, data });
  };
  res.sendError = function (message: string, statusCode = 500) {
    return this.status(statusCode).json({ status: "error", message, data: null });
  };
  next();
}
