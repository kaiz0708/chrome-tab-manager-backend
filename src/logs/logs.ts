import pino from "pino";


export const logger = pino({
  level: "info",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
      {
        target: "pino/file",
        options: {
          destination: "./src/logs/app.log",
          mkdir: true,
        },
      },
    ],
  },
});
