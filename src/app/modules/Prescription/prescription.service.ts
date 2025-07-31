import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  Prisma,
} from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IPaginations } from "../../interfaces/pagination";
import { prisma } from "../../../shared/prisma";
import AppError from "../../../shared/appError";
import httpStatus from "http-status";
import { calculatePagination } from "../../../helper/paginationHelper";

const insertIntoDB = async (
  user: JwtPayload,
  payload: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });

  if (user.email !== appointmentData.doctor.email) {
    throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment");
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctor.id,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const getPrescriptionByAppointmentId = async (appointmentId: string) => {
  const prescription = await prisma.prescription.findFirst({
    where: {
      appointmentId,
    },
  });

  if (!prescription) {
    throw new AppError(httpStatus.NOT_FOUND, "Prescription not found");
  }

  return prescription;
};

const updatePrescriptionById = async (
  id: string,
  data: Partial<Prisma.PrescriptionUpdateInput>
) => {
  const existingPrescription = await prisma.prescription.findFirst({
    where: { id },
  });

  if (!existingPrescription) {
    throw new AppError(httpStatus.NOT_FOUND, "Prescription not found");
  }

  const updatedPrescription = await prisma.prescription.update({
    where: { id },
    data,
  });

  return updatedPrescription;
};

const patientPrescription = async (user: JwtPayload, options: IPaginations) => {
  const { limit, page, skip } = calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user?.email,
      },
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getAllFromDB = async (filters: any, options: IPaginations) => {
  const { limit, page, skip } = calculatePagination(options);
  const { patientEmail, doctorEmail } = filters;
  const andConditions = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  }

  if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
    });
  }

  const whereConditions: Prisma.PrescriptionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.prescription.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  const total = await prisma.prescription.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const PrescriptionService = {
  insertIntoDB,
  getPrescriptionByAppointmentId,
  updatePrescriptionById,
  patientPrescription,
  getAllFromDB,
};
