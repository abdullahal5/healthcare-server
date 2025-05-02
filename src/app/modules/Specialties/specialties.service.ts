import { Request } from "express";
import { IFile } from "../../interfaces/file";
import { uploadToCloudinary } from "../../../helper/fileUploader";
import { prisma } from "../../../shared/prisma";

const createSpecialtiesIntoDB = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadFile = await uploadToCloudinary(file);
    req.body.icon = uploadFile?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getSpecialtiesFromDB = async () => {
  return await prisma.specialties.findMany();
};

const deleteSpecialtiesFromDB = async (id: string) => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecailtiesServices = {
  createSpecialtiesIntoDB,
  getSpecialtiesFromDB,
  deleteSpecialtiesFromDB,
};
