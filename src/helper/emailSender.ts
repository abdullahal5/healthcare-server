import config from "../config";
import nodemailer from "nodemailer";

export const emailSender = async (email: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // or 465 (with secure: true)
      secure: false, // true for 465, false for 587
      auth: {
        user: "abdullahalfahin183@gmail.com",
        pass: "njvx iwhw wdnm mxqo", // App Password (no spaces?)
      },
    });

    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (error) {
      console.error("❌ SMTP verification failed:", error);
      throw error;
    }

    await transporter.sendMail({
      from: '"PH Health Care" <abdullahalfahin183@gmail.com>',
      to: email,
      subject: "Reset Password Link",
      text: "",
      html,
    });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    throw new Error("Failed to send email.");
  }
};
