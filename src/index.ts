import app from "./app";
import ENV from "./common/config/env";
import Logger from "./common/config/logger";
import prisma from "./common/config/prisma";

const { nodeEnv, port } = ENV;
const server = app.listen(port, () => {
  Logger.info(`${nodeEnv} server running on port ${port}`);
});

const onCloseSignal = async () => {
  Logger.info("sigint received, shutting down");

  Logger.info("Disconnecting from DB");
  await prisma.$disconnect();
  Logger.info("Disconnected from DB");

  server.close(() => {
    Logger.info("Server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
