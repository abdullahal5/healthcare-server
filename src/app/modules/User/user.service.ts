import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";
import { Request } from "express";
import { IFile } from "../../interfaces/file";
import { uploadToCloudinary } from "../../../helper/fileUploader";

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

export const UserService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
};
