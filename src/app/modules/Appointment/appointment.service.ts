import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../../shared/prisma";
import { IPaginations } from "../../interfaces/pagination";
import { v4 as uuidv4 } from "uuid";

const createAppointment = async (user: JwtPayload, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheuleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    const today = new Date();

    const transactionId =
      "PH-HealthCare-" +
      today.getFullYear() +
      "-" +
      today.getMonth() +
      "-" +
      today.getDay() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes();

    console.log(transactionId);

    return appointmentData;
  });

  return result;
};

const getMyAppointment = async (
  user: JwtPayload,
  filters: any,
  options: IPaginations
) => {};

const getAllFromDB = async (filters: any, options: IPaginations) => {};

const changeAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: JwtPayload
) => {};

const cancelUnpaidAppointments = async () => {};

export const AppointmentService = {
  createAppointment,
  getMyAppointment,
  getAllFromDB,
  changeAppointmentStatus,
  cancelUnpaidAppointments,
};
