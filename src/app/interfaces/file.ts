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

export interface ICloudinaryResponse {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
}
