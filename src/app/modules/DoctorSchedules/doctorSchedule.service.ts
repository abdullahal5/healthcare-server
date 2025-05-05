import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { IPaginations } from "../../interfaces/pagination";
import { JwtPayload } from "jsonwebtoken";
import { IDoctorScheduleFilterRequest } from "./doctorSchedule.interface";
import { prisma } from "../../../shared/prisma";

const insertIntoDB = async (
  user: JwtPayload,
  payload: {
    scheduleIds: string[];
  }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  return result;
};

const getMySchedule = async (
  filters: any,
  options: IPaginations,
  user: JwtPayload
) => {};

const deleteFromDB = async (user: JwtPayload, scheduleId: string) => {};

const getAllFromDB = async (
  filters: IDoctorScheduleFilterRequest,
  options: IPaginations
) => {};

export const DoctorScheduleService = {
  insertIntoDB,
  getMySchedule,
  deleteFromDB,
  getAllFromDB,
};
