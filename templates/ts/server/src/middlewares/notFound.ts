import type { Request, Response } from "express";
import { NotFoundError } from "@/errors";

export function notFoundHandler(_req: Request, _res: Response) {
  throw new NotFoundError("Route not found");
}
