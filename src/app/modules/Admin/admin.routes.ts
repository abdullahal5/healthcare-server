import express from "express";
import { AdminController } from "./admin.controller";
const router = express.Router();
import { validateRequest } from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validation";
import { auth } from "../../middleware/auth";
import { UserRole } from "@prisma/client";

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getAllAdmin
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getSingleAdminById
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(AdminValidation.updateAdminSchema),
  AdminController.updateAdminById
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.deleteAdmin
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.softDeleteAdmin
);

export const AdminRoutes = router;
