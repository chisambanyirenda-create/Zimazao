import app from "./app";
import { logger } from "./lib/logger";
import { runMigrations } from "./lib/migrate";

const rawPort = process.env["API_PORT"] || process.env["PORT"];

if (!rawPort) {
  throw new Error("API_PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid port value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");

  // Run migrations after the pool has had time to warm up
  setTimeout(() => {
    runMigrations().catch((e) => logger.error({ err: e }, "Migration failed"));
  }, 4000);
});
