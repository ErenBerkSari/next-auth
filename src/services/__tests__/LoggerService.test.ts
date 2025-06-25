/**
 * @jest-environment node
 */
import { LoggerService } from '../LoggerService';
import { LogLevel } from '../interfaces/ILoggerService';

describe('LoggerService', () => {
  let logger: LoggerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new LoggerService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('Basic logging', () => {
    it('should log info messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.warn('warn message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.error('error message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.debug('debug message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Log structure validation', () => {
    it('should include timestamp in log entries', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('test message');
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
    });

    it('should handle empty messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle null messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info(null as any);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle undefined context', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('test message', undefined);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context).toEqual({});
    });

    it('should handle null context', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('test message', null);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context).toEqual({});
    });
  });

  describe('Error logging with objects', () => {
    it('should log error objects', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error with stack trace', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      logger.error('Error occurred', error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error without error object', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.error('Error occurred');
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context.error).toBeUndefined();
    });

    it('should log error with undefined error object', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.error('Error occurred', undefined);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context.error).toBeUndefined();
    });

    it('should log error with context and error object', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      logger.error('Error occurred', error, context);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context.userId).toBe('123');
      expect(parsed.context.action).toBe('test');
      expect(parsed.context.error).toBeDefined();
    });
  });

  describe('Context logging', () => {
    it('should log with additional context', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle complex context objects', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const context = {
        user: { id: '123', email: 'test@example.com' },
        request: { method: 'POST', url: '/api/auth' }
      };
      logger.info('API request', context);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle empty context object', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('test message', {});
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context).toEqual({});
    });
  });

  describe('Error handling', () => {
    it('should handle JSON.stringify errors gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularObject: any = {};
      circularObject.self = circularObject;
      
      expect(() => {
        logger.info('test message', circularObject);
      }).not.toThrow();
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LoggerService production log error:'),
        expect.any(TypeError)
      );
      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe('Error handler methods', () => {
    it('should handle errors with context', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      logger.handleError(error, 'test context');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle errors without context', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      logger.handleError(error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should identify operational errors', () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      expect(logger.isOperationalError(validationError)).toBe(true);
    });

    it('should identify AuthenticationError as operational', () => {
      const authError = new Error('Authentication failed');
      authError.name = 'AuthenticationError';
      expect(logger.isOperationalError(authError)).toBe(true);
    });

    it('should identify AuthorizationError as operational', () => {
      const authzError = new Error('Authorization failed');
      authzError.name = 'AuthorizationError';
      expect(logger.isOperationalError(authzError)).toBe(true);
    });

    it('should identify NotFoundError as operational', () => {
      const notFoundError = new Error('Resource not found');
      notFoundError.name = 'NotFoundError';
      expect(logger.isOperationalError(notFoundError)).toBe(true);
    });

    it('should identify non-operational errors', () => {
      const networkError = new Error('Network failed');
      networkError.name = 'NetworkError';
      expect(logger.isOperationalError(networkError)).toBe(false);
    });

    it('should identify errors without name as non-operational', () => {
      const genericError = new Error('Generic error');
      expect(logger.isOperationalError(genericError)).toBe(false);
    });

    it('should create errors with status code', () => {
      const error = logger.createError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect((error as any).statusCode).toBe(400);
    });

    it('should create errors with default status code', () => {
      const error = logger.createError('Test error');
      expect(error.message).toBe('Test error');
      expect((error as any).statusCode).toBe(500);
    });

    it('should create errors with zero status code', () => {
      const error = logger.createError('Test error', 0);
      expect(error.message).toBe('Test error');
      expect((error as any).statusCode).toBe(0);
    });

    it('should create errors with negative status code', () => {
      const error = logger.createError('Test error', -1);
      expect(error.message).toBe('Test error');
      expect((error as any).statusCode).toBe(-1);
    });
  });

  describe('Log level methods', () => {
    it('should use correct log levels', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.log(LogLevel.DEBUG, 'debug message');
      logger.log(LogLevel.INFO, 'info message');
      logger.log(LogLevel.WARN, 'warn message');
      logger.log(LogLevel.ERROR, 'error message');
      
      expect(consoleSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle context in log method', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const context = { test: 'data' };
      logger.log(LogLevel.INFO, 'test message', context);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle undefined context in log method', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.log(LogLevel.INFO, 'test message', undefined);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context).toEqual({});
    });

    it('should handle null context in log method', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      logger.log(LogLevel.INFO, 'test message', null);
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      expect(parsed.context).toEqual({});
    });
  });

  describe('Development vs Production logging', () => {
    it('should use JSON format in test environment', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.info('test message');
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(() => JSON.parse(logCall)).not.toThrow();
      const parsed = JSON.parse(logCall);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should handle development environment logging', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';
      
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const devLogger = new LoggerService();
      
      devLogger.info('test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(typeof logCall).toBe('string');
      expect(logCall).toContain('INFO: test message');
      
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should handle production environment logging', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const prodLogger = new LoggerService();
      
      prodLogger.info('test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(() => JSON.parse(logCall)).not.toThrow();
      
      (process.env as any).NODE_ENV = originalEnv;
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle errors with undefined stack trace', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      error.stack = undefined;
      logger.error('Error occurred', error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle errors with null stack trace', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const error = new Error('Test error');
      error.stack = null as any;
      logger.error('Error occurred', error);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle non-Error objects in error method', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const fakeError = { message: 'Fake error', stack: 'fake stack' };
      logger.error('Error occurred', fakeError as any);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle console.log errors gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console error');
      });
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        logger.info('test message');
      }).not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('LoggerService production log error:'),
        expect.any(Error)
      );
      (process.env as any).NODE_ENV = originalEnv;
    });
  });
}); 