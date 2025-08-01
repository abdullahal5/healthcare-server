import { Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { Request } from "express";
import { IFile } from "../../interfaces/file";
import { uploadToCloudinary } from "../../../helper/fileUploader";
import { IPaginations } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helper/paginationHelper";
import { userSearchAbleFields } from "./user.constant";
import AppError from "../../../shared/appError";
import status from "http-status";

const createAdminIntoDB = async (req: Request) => {
  const data = req.body;
  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const file = req.file as IFile;

  if (file) {
    const uploadFile = await uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadFile?.secure_url;
  }

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
    loginAttempts: 0,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdUserData = await transactionClient.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const createdAdminData = await transactionClient.admin.create({
      data: data.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctorIntoDB = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadFile = await uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadFile?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

const createPatientIntoDB = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadFile = await uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadFile?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: req.body.patient,
    });

    return createdPatientData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: IPaginations) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditons: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeStatus = async (id: string, status: UserRole) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

const getMyProfile = async (
  user: Prisma.UserGetPayload<{
    include: {
      admin: true;
      doctor: true;
      patient: true;
    };
  }>,
  query?: { role?: string; id?: string }
) => {
  // If id are provided, fetch by those first
  if (query?.id) {
    const id = query.id;

    let profile;
    let role: "ADMIN" | "DOCTOR" | "PATIENT" | null = null;

    try {
      // Try admin
      profile = await prisma.admin.findUnique({ where: { id } });
      if (profile) role = "ADMIN";
    } catch {}

    if (!profile) {
      try {
        profile = await prisma.doctor.findUnique({ where: { id } });
        if (profile) role = "DOCTOR";
      } catch {}
    }

    if (!profile) {
      try {
        profile = await prisma.patient.findUnique({
          where: { id },
          include: {
            patientHealthData: true,
            medicalReport: true,
          },
        });
        if (profile) role = "PATIENT";
      } catch {}
    }

    if (!profile || !role) {
      throw new AppError(status.NOT_FOUND, "User not found in any role table");
    }

    // Now fetch user info
    const userInfo = await prisma.user.findUnique({
      where: {
        email: profile.email,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!userInfo) {
      throw new AppError(status.NOT_FOUND, "User info not found in user table");
    }

    return {
      ...profile,
      ...userInfo,
    };
  }

  // Otherwise, fetch profile for current logged-in user by email
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (
    userInfo.role === UserRole.ADMIN ||
    userInfo.role === UserRole.SUPER_ADMIN
  ) {
    profileInfo = await prisma.admin.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUniqueOrThrow({
      where: {
        email: userInfo.email,
      },
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};

// const getMyProfile = async (
//   user: Prisma.UserGetPayload<{
//     include: {
//       admin: true;
//       doctor: true;
//       patient: true;
//     };
//   }>,
//   query: Record<string, unknown>
// ) => {
//   const userInfo = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: user?.email,
//       status: UserStatus.ACTIVE,
//     },
//     select: {
//       id: true,
//       email: true,
//       needPasswordChange: true,
//       role: true,
//       status: true,
//     },
//   });

//   let profileInfo;

//   if (
//     userInfo.role === UserRole.ADMIN ||
//     userInfo.role === UserRole.SUPER_ADMIN
//   ) {
//     profileInfo = await prisma.admin.findUniqueOrThrow({
//       where: {
//         email: userInfo.email,
//       },
//     });
//   } else if (userInfo.role === UserRole.DOCTOR) {
//     profileInfo = await prisma.doctor.findUniqueOrThrow({
//       where: {
//         email: userInfo.email,
//       },
//     });
//   } else if (userInfo.role === UserRole.PATIENT) {
//     profileInfo = await prisma.patient.findUniqueOrThrow({
//       where: {
//         email: userInfo.email,
//       },
//       include: {
//         patientHealthData: true,
//         medicalReport: true,
//       },
//     });
//   }

//   return { ...userInfo, ...profileInfo };
// };

const updateMyProfie = async (
  user: Prisma.UserGetPayload<{
    include: {
      admin: true;
      doctor: true;
      patient: true;
    };
  }>,
  req: Request
) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file as IFile;

  if (file) {
    const uploadFile = await uploadToCloudinary(file);
    req.body.profilePhoto = uploadFile?.secure_url;
  }

  let profileInfo;

  if (
    userInfo.role === UserRole.SUPER_ADMIN ||
    userInfo.role === UserRole.ADMIN
  ) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    // Prepare the health data
    const healthData = {
      gender: req.body.patientHealthData.gender,
      dateOfBirth: req.body.patientHealthData.dateOfBirth,
      bloodGroup: req.body.patientHealthData.bloodGroup,
      height: req.body.patientHealthData.height,
      weight: req.body.patientHealthData.weight,
      hasAllergies: req.body.patientHealthData.hasAllergies,
      hasDiabetes: req.body.patientHealthData.hasDiabetes,
      dietaryPreferences: req.body.patientHealthData.dietaryPreferences,
      mentalHealthHistory: req.body.patientHealthData.mentalHealthHistory,
      immunizationStatus: req.body.patientHealthData.immunizationStatus,
      smokingStatus: req.body.patientHealthData.smokingStatus,
      pregnancyStatus: req.body.patientHealthData.pregnancyStatus,
      hasPastSurgeries: req.body.patientHealthData.hasPastSurgeries,
      recentAnxiety: req.body.patientHealthData.recentAnxiety,
      recentDepression: req.body.patientHealthData.recentDepression,
      maritalStatus: req.body.patientHealthData.maritalStatus,
    };

    // Validate required fields
    if (
      !healthData.gender ||
      !healthData.dateOfBirth ||
      !healthData.bloodGroup ||
      !healthData.height ||
      !healthData.weight
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Missing required health data fields"
      );
    }

    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: {
        name: req.body.name,
        profilePhoto: req.body.profilePhoto,
        contactNumber: req.body.contactNumber,
        address: req.body.address,
        patientHealthData: {
          upsert: {
            create: healthData,
            update: healthData,
          },
        },
      },
      include: {
        patientHealthData: true,
      },
    });
  }

  return { ...profileInfo };
};

export const UserService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllFromDB,
  changeStatus,
  getMyProfile,
  updateMyProfie,
};
