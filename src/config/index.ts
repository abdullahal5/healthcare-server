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
  ssl: {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_pass: process.env.SSLCOMMERZ_STORE_PASSWORD,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    fail_url: process.env.FAIL_URL,
    ssl_paymentApi: process.env.SSLCOMMERZ_PAYMENT_API,
    ssl_validationApi: process.env.SSLCOMMERZ_VALIDATION_API,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME_KEY,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
    cloudinary_url: process.env.CLOUDINARY_URL,
  },
};
