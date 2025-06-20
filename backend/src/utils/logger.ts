import { createLogger, format, transports, Logger } from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction
    ? format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      )
    : format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
  transports: [
    new transports.Console(),
    ...(isProduction
      ? [
          new transports.File({ filename: 'error.log', level: 'error' }),
          new transports.File({ filename: 'combined.log' }),
        ]
      : []),
  ],
});

export function getLogger(moduleName: string): Logger {
  return logger.child({ module: moduleName });
}

export default logger; 