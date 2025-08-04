import { Patient, Prisma, UserStatus } from "@prisma/client";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { IPaginations } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helper/paginationHelper";
import { patientSearchableFields } from "./patient.constant";
import { prisma } from "../../../shared/prisma";
import { IFile } from "../../interfaces/file";
import { uploadToCloudinary } from "../../../helper/fileUploader";

const getAllFromDB = async (
  filters: IPatientFilterRequest,
  options: IPaginations
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
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
      medicalReport: true,
      patientHealthData: true,
      user: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const total = await prisma.patient.count({
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

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
      user: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
  return result;
};

const updateIntoDB = async (id: string, data: any, files: IFile[]) => {
  return await prisma.$transaction(async (transactionClient) => {
    const patientInfo = await transactionClient.patient.findUnique({
      where: { id },
    });

    if (!patientInfo) throw new Error("Patient not found");

    // Extract patientHealthData and reportName from data, rest is patient fields
    const { patientHealthData, reportName, ...patientFields } = data;

    // Remove patientId if exists by accident
    delete (patientFields as any).patientId;

    // Update Patient fields and nested patientHealthData if any
    const updatedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        ...patientFields,
        patientHealthData: patientHealthData
          ? {
              upsert: {
                update: patientHealthData,
                create: { ...patientHealthData, patientId: id },
              },
            }
          : undefined,
      },
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    // Handle files as medical reports
    if (files?.length > 0) {
      for (const file of files) {
        const uploadFile = await uploadToCloudinary(file);

        await transactionClient.medicalReport.create({
          data: {
            reportName: reportName || "Unnamed report",
            reportLink: uploadFile?.secure_url as string,
            patientId: id,
          },
        });
      }
    }

    return updatedPatient;
  });
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    await transactionClient.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    const deletedPatient = await transactionClient.patient.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: deletedPatient.email,
      },
    });

    return deletedPatient;
  });

  return result;
};

const softDelete = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
};
