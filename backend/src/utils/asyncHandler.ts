import type { NextFunction, Request, Response } from "express";

export const asyncHandler = (fn: Function) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
