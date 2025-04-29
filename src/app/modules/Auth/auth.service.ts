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

const MAX_ATTEMPTS = 10;
const LOCK_DURATION_HOURS = 2;

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (userData.lockedUntil && userData.lockedUntil > new Date()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your account is locked until ${userData.lockedUntil.toLocaleString()}. Please try again later.`
    );
  }

  if (forbiddenStatuses.includes(userData.status)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This user is already ${userData.status}`
    );
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    const isLimitReached = userData.loginAttempts + 1 >= MAX_ATTEMPTS;
    const lockedUntilDate = isLimitReached
      ? new Date(Date.now() + LOCK_DURATION_HOURS * 60 * 60 * 1000)
      : undefined;

    await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        loginAttempts: {
          increment: 1,
        },
        ...(isLimitReached && {
          lockedUntil: lockedUntilDate,
        }),
      },
    });

    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  } else {
    await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  await prisma.user.update({
    where: { id: userData.id },
    data: {
      lastLogin: new Date(),
    },
  });

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
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

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
