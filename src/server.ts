import app from "./app";
import config from "./config";

// For Vercel deployment, we only need to export the app
export default app;

// Local development server (only runs when not in Vercel environment)
if (process.env.VERCEL !== "1") {
  const port = Number(config.port);
  app.listen(port, () => {
    console.log(`Server is running successfully on http://localhost:${port}`);
  });
}
