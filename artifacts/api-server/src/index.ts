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

// Start listening immediately, run migrations in background with retry
app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");

  // Retry migration up to 5 times with 3s gap to allow pool to warm up
  let attempts = 0;
  const tryMigrate = () => {
    attempts++;
    runMigrations()
      .then(() => logger.info("Migrations complete"))
      .catch((e) => {
        logger.warn({ err: e, attempt: attempts }, "Migration attempt failed");
        if (attempts < 5) setTimeout(tryMigrate, 3000);
        else logger.error({ err: e }, "Migrations permanently failed — app running in degraded mode");
      });
  };
  setTimeout(tryMigrate, 2000);
});
