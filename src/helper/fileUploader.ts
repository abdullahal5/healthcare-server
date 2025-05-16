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
    if (!file.buffer) {
      reject(new Error("File buffer is missing"));
      return;
    }

    // Validate mimetype exists
    if (!file.mimetype) {
      reject(new Error("File mimetype is missing"));
      return;
    }

    if (file.mimetype === "image/svg+xml") {
      // Additional SVG validation
      try {
        const svgString = file.buffer.toString();
        if (
          !svgString.includes("<svg") ||
          !svgString.includes('xmlns="http://www.w3.org/2000/svg"')
        ) {
          reject(new Error("Invalid SVG file"));
          return;
        }

        cloudinary.uploader.upload(
          `data:image/svg+xml;base64,${file.buffer.toString("base64")}`,
          {
            resource_type: "image",
            type: "upload",
            format: "svg",
            tags: ["svg_upload"],
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("No result from Cloudinary"));
          }
        );
      } catch (e) {
        reject(new Error("Failed to process SVG file"));
      }
    } else {
      // For non-SVG files
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            format: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("No result from Cloudinary"));
          }
        )
        .end(file.buffer);
    }
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
