import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { IDoctorFilterRequest, IDoctorUpdate } from "./doctor.interface";
import { IPaginations } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../../shared/prisma";

const getAllFromDB = async (
  filters: IDoctorFilterRequest,
  options: IPaginations
) => {
  
};

const getByIdFromDB = async (id: string) => {};

const updateIntoDB = async (id: string, payload: IDoctorUpdate) => {};

const deleteFromDB = async (id: string) => {};

const softDelete = async (id: string) => {};

export const DoctorService = {
  updateIntoDB,
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
};
