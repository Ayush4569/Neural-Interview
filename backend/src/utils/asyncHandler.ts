import type { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (fn: RequestHandler):RequestHandler => {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
