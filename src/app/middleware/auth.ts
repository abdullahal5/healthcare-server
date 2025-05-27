import { NextFunction, Request, Response } from "express";
import AppError from "../../shared/appError";
import config from "../../config";
import { jwtHelpers } from "../../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";

export const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.headers.authorization);
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      req.user = verifiedUser;

      next();
    } catch (error) {
      next(error);
    }
  };
};
