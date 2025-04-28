import { $Enums, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import { prisma } from "../../../shared/prisma";
import AppError from "../../../shared/appError";
import { forbiddenStatuses } from "../../constant";
import jwt from "jsonwebtoken";
import { jwtHelpers } from "../../../helper/jwtHelper";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (forbiddenStatuses.includes(userData.status)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This user is already ${userData.status}`
    );
  }

  const isCorrectPassword: boolean = bcrypt.compareSync(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (token: string) => {};

const changePassword = async (user: any, payload: any) => {};

const forgotPassword = async (payload: { email: string }) => {};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
