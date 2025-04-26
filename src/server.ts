import { Server } from "http";
import app from "./app";
import config from "./config";

// Optional: if using Prisma
// import { prisma } from "./lib/prisma";

const port = Number(config.port);
let server: Server;

async function main() {
  try {
    server = app.listen(port, () => {
      console.log("✅ 🚀 Server is running successfully!");
      console.log(`🌐 Listening on: http://localhost:${port}`);
    });

    server.on("error", (err) => {
      console.error("❌ Server failed to start:", err);
    });

    // Optional: Check DB connection on startup if using Prisma or pg
    // await prisma.$connect();
    // console.log("🛢️ Connected to PostgreSQL database!");
  } catch (error: any) {
    console.error("🔥 Failed to launch server:", error?.message || error);
    process.exit(1);
  }
}

main();

// =======================
// 🔒 Global error handlers
// =======================

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("🚨 Unhandled Rejection:", reason);
  shutdown();
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  shutdown();
});

// Graceful shutdown
function shutdown() {
  console.log("👋 Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("✅ Server closed.");
      // Close DB connection if needed
      // await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

// Optional: Handle SIGTERM (useful in deployment environments)
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received. Gracefully shutting down...");
  shutdown();
});
