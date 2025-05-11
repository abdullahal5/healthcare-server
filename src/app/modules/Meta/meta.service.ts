import { PaymentStatus, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../../shared/prisma";

const fetchDashboardMetaData = async (user: JwtPayload) => {
  let metaData;
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user);
      break;
    default:
      throw new Error("Invalid user role");
  }

  return metaData;
};

const getSuperAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const formattedTotalRevenue = {
    amount: Number(totalRevenue._sum.amount),
  };

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    adminCount,
    paymentCount,
    totalRevenue: formattedTotalRevenue.amount,
  };
};

const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });

  const formattedTotalRevenue = {
    amount: Number(totalRevenue._sum.amount),
  };

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenue: formattedTotalRevenue.amount,
  };
};

const getDoctorMetaData = async (user: JwtPayload) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedAppointmentCount = {
    count: Number(appointmentCount),
  };

  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      id: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedReviewCount = {
    count: Number(reviewCount),
  };

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
    },
  });

  const formattedTotalRevenue = {
    totalAmount: Number(totalRevenue._sum.amount || 0),
  };

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount: formattedAppointmentCount.count,
    patientCount: patientCount.length,
    reviewCount: formattedReviewCount.count,
    totalRevenue: formattedTotalRevenue.totalAmount,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getPatientMetaData = async (user: JwtPayload) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });

  const formattedAppointmentCount = {
    count: Number(appointmentCount),
  };

  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const formattedReviewCount = {
    count: Number(reviewCount),
  };

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      patientId: patientData.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: Number(_count.id),
    }));

  return {
    appointmentCount: formattedAppointmentCount.count,
    prescriptionCount,
    reviewCount: formattedReviewCount.count,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getBarChartData = async () => {};

export const MetaService = {
  fetchDashboardMetaData,
};
