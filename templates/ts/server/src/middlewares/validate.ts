import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "@/errors";

export function validate<T>(
  schema: ZodType<T>,
  source: "body" | "params" | "query" = "body",
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join("; ");
      return next(new BadRequestError(messages));
    }
    if (source === "body") req.body = result.data;
    next();
  };
}
