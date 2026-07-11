declare namespace Express {
  interface Response {
    sendSuccess<T>(data: T, message?: string, statusCode?: number): this;
    sendError(message: string, statusCode?: number): this;
  }
}
