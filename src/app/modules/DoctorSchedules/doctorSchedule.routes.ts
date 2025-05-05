import { UserRole } from "@prisma/client";
import express from "express";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  DoctorScheduleController.getAllFromDB
);

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.getMySchedule
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(DoctorScheduleValidation.create),
  DoctorScheduleController.insertIntoDB
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  DoctorScheduleController.deleteFromDB
);

export const DoctorScheduleRoutes = router;
