import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import { prisma } from "../../../shared/prisma";
import AppError from "../../../shared/appError";
import { forbiddenStatuses } from "../../constant";
import { jwtHelpers } from "../../../helper/jwtHelper";
import emailSender from "../../../helper/emailSender";

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
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (forbiddenStatuses.includes(userData.status)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This user is already ${userData.status}`
    );
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password Changed Successfully",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  const resetPasswordLink = `${config.reset_pass_link}/reset-password?userId=${userData.id}&token=${resetPassToken}`;

  const emailHtml = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #4a90e2; padding: 20px 30px;">
        <h2 style="color: white; margin: 0;">Reset Your Password</h2>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333333;">Hello <strong>${
          userData.id || "id"
        }</strong>,</p>
        <p style="font-size: 15px; color: #555555;">
          We received a request to reset your password. Click the button below to reset it. 
          If you didn't request this, please ignore this email.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetPasswordLink}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #ff4d4f; text-align: center; font-weight: bold;">
          ⚠️ This link is valid for 5 minutes only.
        </p>
        <p style="font-size: 14px; color: #999999;">
          Or copy and paste this link into your browser:
          <br>
          <a href="${resetPasswordLink}" style="color: #4a90e2;">${resetPasswordLink}</a>
        </p>
        <p style="font-size: 13px; color: #cccccc; margin-top: 40px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  </div>
`;

  await emailSender(userData.email, emailHtml);
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: "ACTIVE",
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Token expires");
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
