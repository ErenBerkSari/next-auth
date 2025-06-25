import { ILoggerService, IErrorHandler, LogLevel } from './interfaces/ILoggerService';

export class LoggerService implements ILoggerService, IErrorHandler {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: any): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.stack });
  }

  log(level: LogLevel, message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {},
    };

    if (this.isDevelopment) {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, context || '');
    } else {
      // In production, you might want to send logs to a service like CloudWatch, Loggly, etc.
      console.log(JSON.stringify(logEntry));
    }
  }

  handleError(error: Error, context?: string): void {
    this.error(`Error in ${context || 'unknown context'}: ${error.message}`, error);
    
    if (!this.isOperationalError(error)) {
      // For non-operational errors, you might want to send alerts
      this.warn('Non-operational error detected, consider sending alert', { error: error.message });
    }
  }

  isOperationalError(error: Error): boolean {
    // Define what constitutes an operational error
    const operationalErrors = [
      'ValidationError',
      'AuthenticationError',
      'AuthorizationError',
      'NotFoundError'
    ];
    
    return operationalErrors.some(type => error.name === type);
  }

  createError(message: string, statusCode: number = 500): Error {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }
} 