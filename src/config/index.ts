import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  allow_origins: process.env.ALLOWED_ORIGINS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME_KEY,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    cloudinary_url: process.env.CLOUDINARY_URL,
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    stripe_webhook_key: process.env.STRIPE_WEBHOOK_KEY,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    fail_url: process.env.FAIL_URL,
  },
};
