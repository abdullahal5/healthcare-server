import status from "http-status";
import AppError from "../../../shared/appError";
import { prisma } from "../../../shared/prisma";
import { Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IDoctorFilterRequest } from "../doctor/doctor.interface";
import { IPaginations } from "../../interfaces/pagination";
import { paymentSearchableFields } from "./payment.constant";
import Stripe from "stripe";
import config from "../../../config";

const stripe = new Stripe(config.stripe.stripe_secret_key!, {
  apiVersion: "2025-07-30.basil",
  typescript: true,
});

const initStripePayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: true,
          schedule: true,
        },
      },
    },
  });

  const appointment = paymentData.appointment;

  if (!appointment || !appointment.patient) {
    throw new AppError(status.NOT_FOUND, "Invalid appointment or patient");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          unit_amount: paymentData.amount * 100,
          product_data: {
            name: `Appointment with Dr. ${appointment.doctor.name}`,
            description:
              `🆔 Transaction ID: ${paymentData.transactionId} | ` +
              `👤 Patient: ${appointment.patient.name} | ` +
              `📅 Date: ${
                appointment.schedule.startDateTime.toISOString().split("T")[0]
              } | ` +
              `⏰ Time: ${new Date(
                appointment.schedule.startDateTime
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(
                appointment.schedule.endDateTime
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            images: [
              appointment.doctor.profilePhoto ||
                "https://img.freepik.com/free-icon/user_318-563642.jpg",
            ],
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId,
      transactionId: paymentData.transactionId,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
    },
    customer_email: appointment.patient.email || undefined,
    success_url: config.stripe.success_url,
    cancel_url: config.stripe.fail_url,
  });

  return {
    Url: session.url,
  };
};

const getPatientPaymentHistory = async (
  filters: IDoctorFilterRequest,
  options: IPaginations,
  user: JwtPayload
) => {
  const limit = Number(options.limit ?? 10);
  const page = Number(options.page ?? 1);
  const skip = (page - 1) * limit;
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.PaymentWhereInput[] = [];

  // Filter by user email
  andConditions.push({
    appointment: {
      patient: {
        email: user.email,
      },
    },
  });

  // Search term filter
  if (searchTerm) {
    andConditions.push({
      OR: paymentSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.PaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.payment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      appointment: {
        include: {
          doctor: true,
        },
      },
    },
  });

  const total = await prisma.payment.count({
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

const getSinglePaymentByID = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          doctor: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const PaymentService = {
  initStripePayment,
  getPatientPaymentHistory,
  getSinglePaymentByID,
};
