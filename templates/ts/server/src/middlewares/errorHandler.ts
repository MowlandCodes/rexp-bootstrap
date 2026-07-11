import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/errors";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.sendError(err.message, err.statusCode);
    return;
  }

  console.error(err);
  res.sendError("Internal Server Error", 500);
}
