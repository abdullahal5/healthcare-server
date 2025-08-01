import express, { NextFunction, Request, Response } from "express";
import { PatientController } from "./patient.Controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "@prisma/client";
import { upload } from "../../../helper/fileUploader";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT, UserRole.DOCTOR),
  PatientController.getAllFromDB
);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT, UserRole.DOCTOR),
  PatientController.getByIdFromDB
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT),
  upload.array("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return PatientController.updateIntoDB(req, res, next);
  }
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PatientController.deleteFromDB
);

router.delete(
  "/soft/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PatientController.softDelete
);

export const PatientRoutes = router;
