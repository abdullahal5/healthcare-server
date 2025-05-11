import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IPaginations } from "../../interfaces/pagination";

const insertIntoDB = async (user: JwtPayload, payload: any) => {};

const getAllFromDB = async (filters: any, options: IPaginations) => {};

export const ReviewService = {
  insertIntoDB,
  getAllFromDB,
};
