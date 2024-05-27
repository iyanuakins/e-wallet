import app from "./app";
import ENV from "./common/config/envConfig";
import Logger from "./common/config/logger";

const { nodeEnv, port } = ENV;
const server = app.listen(port, () => {
  Logger.info(`${nodeEnv} server running on port ${port}`);
});

const onCloseSignal = () => {
  Logger.info("sigint received, shutting down");
  server.close(() => {
    Logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
