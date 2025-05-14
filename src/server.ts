import { Server } from "http";
import app from "./app";
import config from "./config";

const port = Number(config.port);
let server: Server;

async function main() {
  try {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env !== "production";

    console.log(`Environment: ${env}`);

    if (isDevelopment) {
      console.log("Running in development mode - using Vercel's server");
      return app; // In Vercel Dev, Vercel handles the server
    }

    server = app.listen(port, () => {
      console.log(`Server is running successfully on http://localhost:${port}`);
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
    });
  } catch (error) {
    console.error("🔥 Failed to launch server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "production") {
  server = app.listen(config.port, () => {
    console.log(`Server is on ${config.port}`);
  });
}

// =======================
// 🔒 Global Error Handlers
// =======================

process.on("unhandledRejection", (reason) => {
  console.error("🚨 Unhandled Rejection:", reason);
  shutdown();
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  shutdown();
});

process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received. Shutting down...");
  shutdown();
});

function shutdown() {
  console.log("👋 Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}
