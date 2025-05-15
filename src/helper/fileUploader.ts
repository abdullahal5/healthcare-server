import multer, { StorageEngine } from "multer";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { Request } from "express";
import config from "../config";
import { ICloudinaryResponse, IFile } from "../app/interfaces/file";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage: StorageEngine = multer.memoryStorage();

export const upload = multer({ storage });

export const uploadToCloudinary = async (
  file: IFile
): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.url,
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
            });
          }
        }
      )
      .end(file.buffer);
  });
};

export const handleFileUpload = async (req: Request) => {
  const file = req.file;
  if (!file) {
    throw new Error("No file uploaded");
  }

  try {
    const result = await uploadToCloudinary(file as IFile);
    return result;
  } catch (error) {
    throw new Error("Error uploading file to Cloudinary");
  }
};
