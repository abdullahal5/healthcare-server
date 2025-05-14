import multer, { StorageEngine } from "multer";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { Request } from "express";
import config from "../config";

// Define IFile type for the incoming file
export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  buffer?: Buffer;
}

// Define ICloudinaryResponse type to match Cloudinary's upload response
export interface ICloudinaryResponse {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  // Add other fields from Cloudinary response as needed
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Set Multer to use memoryStorage to store file in memory
const storage: StorageEngine = multer.memoryStorage();

// Set up the upload function with memoryStorage
export const upload = multer({ storage });

// Function to upload file to Cloudinary
export const uploadToCloudinary = async (
  file: IFile
): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // Automatically determines the file type
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

// Example for Next.js API route typing (if needed)
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
