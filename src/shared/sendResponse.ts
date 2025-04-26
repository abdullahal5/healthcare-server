import { Response } from "express";

type TSendResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T | null | undefined;
};

export const SendResponse = <T>(
  res: Response,
  { statusCode, success, message, data, meta }: TSendResponse<T>
) => {
  res.status(statusCode).json({
    success,
    message,
    data: data || null,
    meta: meta || undefined,
  });
};
