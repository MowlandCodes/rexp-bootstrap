import { BadRequestError } from "@/errors";

export function validate(schema, source = "body") {
  return async (req, _res, next) => {
    const result = await schema.safeParseAsync(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join("; ");
      return next(new BadRequestError(messages));
    }
    if (source === "body") req.body = result.data;
    next();
  };
}
