import express from "express";
import { UserRole } from "@prisma/client";
import { PrescriptionValidation } from "./prescription.validation";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { PrescriptionController } from "./priscription.controller";

const router = express.Router();

router.get(
  "/my-prescription",
  auth(UserRole.PATIENT),
  PrescriptionController.patientPrescription
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PrescriptionController.getAllFromDB
);

router.get(
  "/:appointmentId",
  auth(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PrescriptionController.getByAppointment
);

router.patch(
  "/:id",
  auth(UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PrescriptionController.updatePrescription
);


router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(PrescriptionValidation.create),
  PrescriptionController.insertIntoDB
);

export const PrescriptionRoutes = router;
