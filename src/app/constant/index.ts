import { $Enums, UserStatus } from "@prisma/client";

export const forbiddenStatuses: $Enums.UserStatus[] = [
  UserStatus.BLOCKED,
  UserStatus.DELETED,
];
