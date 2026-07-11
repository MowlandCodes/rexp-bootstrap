import { NotFoundError } from "@/errors";

export function notFoundHandler(_req, _res) {
  throw new NotFoundError("Route not found");
}
