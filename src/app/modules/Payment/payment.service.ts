import status from "http-status";
import AppError from "../../../shared/appError";
import { prisma } from "../../../shared/prisma";
import { SSLService } from "../SSL/ssl.service";
import { PaymentStatus, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IDoctorFilterRequest } from "../doctor/doctor.interface";
import { IPaginations } from "../../interfaces/pagination";
import { paymentSearchableFields } from "./payment.constant";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  const initPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phoneNumber: paymentData.appointment.patient.contactNumber,
  };

  const result = await SSLService.initPayment(initPaymentData);

  return {
    paymentUrl: result.GatewayPageURL,
  };
};

const validatePayment = async (payload: any) => {
  console.log("HELOO");
  if (!payload || !payload.status || payload.status !== "VALID") {
    throw new AppError(status.BAD_REQUEST, "Invalid payment");
  }

  const response = await SSLService.validatePayment(payload);

  if (response?.status !== "VALID") {
    throw new AppError(status.BAD_REQUEST, "Payment failed!");
  }

  console.log(response);

  // const response = payload;

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment success!",
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
}

export const PaymentService = {
  initPayment,
  validatePayment,
  getPatientPaymentHistory,
  getSinglePaymentByID,
};
