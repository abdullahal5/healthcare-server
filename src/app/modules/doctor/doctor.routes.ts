import express, { NextFunction, Request, Response } from "express";
import { DoctorController } from "./doctor.controller";
import { UserRole } from "@prisma/client";
import { DoctorValidation } from "./doctor.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../middleware/auth";
import { upload } from "../../../helper/fileUploader";

const router = express.Router();

router.get("/", DoctorController.getAllFromDB);

router.get("/:id", DoctorController.getByIdFromDB);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      const parsedData = JSON.parse(req.body.data);
      delete parsedData.file;
      req.body = parsedData;
    }
    next();
  },
  validateRequest(DoctorValidation.update),
  DoctorController.updateIntoDB
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.deleteFromDB
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DoctorController.softDelete
);

export const DoctorRoutes = router;
