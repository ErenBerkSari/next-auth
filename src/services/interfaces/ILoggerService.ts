export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface ILoggerService {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  log(level: LogLevel, message: string, context?: any): void;
}

export interface IErrorHandler {
  handleError(error: Error, context?: string): void;
  isOperationalError(error: Error): boolean;
  createError(message: string, statusCode?: number): Error;
} 