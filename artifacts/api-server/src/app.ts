import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import path from "node:path";
import fs from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // disabled so frontend scripts work
  crossOriginEmbedderPolicy: false,
}));

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Large body size to support base64 voice notes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", router);

// ── Serve the built frontend (single-service deploy) ─────────────────────────
// When the compiled website is present, this server also hosts it, so one
// Render service serves both the site and the API from the same URL.
const frontendDir = path.resolve(process.cwd(), "../zimazao/dist/public");
if (fs.existsSync(path.join(frontendDir, "index.html"))) {
  app.use(express.static(frontendDir));
  // SPA fallback: any non-API GET returns the app shell so client routing works.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDir, "index.html"));
  });
  logger.info({ frontendDir }, "Serving frontend from API server");
}

export default app;
