import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";

const loginUser = async (payload: { email: string; password: string }) => {
    
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
