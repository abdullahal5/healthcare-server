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

export const UserService = {
  createAdminIntoDB,
};
