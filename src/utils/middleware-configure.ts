import { doubleCsrf } from "csrf-csrf";
import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import config from "../config";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests, please try again later",
    });
  },
});

export const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: (req?: Request): string => {
    if (!req || !req.cookies?.sessionId) {
      throw new Error("Missing session for CSRF protection");
    }
    return req.cookies.sessionId;
  },
  cookieName:
   config.env === "production"
      ? "__Host-psifi.x-csrf-token"
      : "dev_csrf",
  cookieOptions: {
    secure:config.env === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
  },
  size: 64,
});

export const corsConfigure = {
  origin:config.allow_origins?.split(",") || true,
  credentials: true,
  exposedHeaders: ["X-CSRF-Token"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};