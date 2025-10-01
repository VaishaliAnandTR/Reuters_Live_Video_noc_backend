import bunyan from 'bunyan';
import config from '../Config/index';
import bformat from 'bunyan-format';
import { getTraceId, getSpanId } from './RequestTracer';
export interface PayLoadInterface {
  statusCode?: number;
  data?: any;
}

export interface LoggerInterface {
  info(message: string, method: string, payload?: object): void;
  warn(message: string, method: string, payload?: object): void;
  error(message: string, method: string, payload?: object): void;
  debug(message: string, method: string, payload?: object): void;
}

export class LoggerClass implements LoggerInterface {
  private logger: bunyan;
  private infoLevel: boolean = false;
  private debugLevel: boolean = false;
  private errorLevel: boolean = false;
  private warnLevel: boolean = false;
  private blockedKeywords = ['currentPassword', 'clientSecret', 'newPassword'];

  constructor() {
    this.mapLogLevels();
    this.logger = bunyan.createLogger({
      name: config.APP_NAME,
      level: 'trace', // by default enabling all levels, controlled through env separately
      stream: bformat({
        outputMode: config.NODE_ENV === 'development' ? 'short' : 'bunyan',
        levelInString: true,
        color: true,
      }),
    });
  }
  /**
   * It's written to handle JSON.circular error
   * @param obj
   * @returns
   */
  public customstringify(obj: any) {
    let cache: any = [];
    let str = JSON.stringify(obj, (key, value) => {
      {
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return;
          }
          // Store value in our collection
          cache.push(value);
        }
        return value;
      }
    });
    cache = null; // reset the cache
    return str;
  }
  /**
   * for info log
   * @param message
   * @param payload
   * @param method
   * @returns
   */
  public info(message: string, method: string, payload?: any) {
    if (!this.infoLevel) {
      return;
    }
    let loggerParams = {
      message,
      method,
      traceId: getTraceId(),
      statusCode: payload?.statusCode,
    };
    let finalPayload = payload !== undefined ? payload : {};
    this.logger.info(
      ` start ${JSON.stringify(loggerParams)} payload: ${this.customstringify(
        this.sanitizeLog(finalPayload)
      )}==end`
    );
  }
  /**
   * for warn log
   * @param message
   * @param payload
   * @param method
   * @returns
   */
  public warn(message: string, method: string, payload?: any) {
    if (!this.warnLevel) {
      return;
    }
    let loggerParams = {
      message,
      method,
      traceId: getTraceId(),
      statusCode: payload?.statusCode,
    };

    let finalPayload = payload !== undefined ? payload : {};
    this.logger.warn(
      ` start ${JSON.stringify(loggerParams)} payload: ${this.customstringify(
        this.sanitizeLog(finalPayload)
      )}==end`
    );
  }
  /**
   * for error log
   * @param message
   * @param payload
   * @param method
   * @returns
   */
  public error(message: string, method: string, payload?: any) {
    if (!this.errorLevel) {
      return;
    }

    if (payload instanceof Error) {
      payload = {
        message,
        method,
        traceId: getTraceId(),
        stack: payload?.stack,
      };
    }
    let loggerParams = {
      message,
      method,
      traceId: getTraceId(),
      spanId: getSpanId(),
      statusCode: payload?.statusCode,
    };
    let finalPayload = payload !== undefined ? payload : {};
    this.logger.error(
      ` start ${JSON.stringify(loggerParams)} payload: ${this.customstringify(
        this.sanitizeLog(finalPayload)
      )}==end`
    );
  }
  /**
   * for debug log
   * @param message
   * @param payload
   * @param method
   * @returns
   */
  public debug(message: string, method: string, payload?: any) {
    if (!this.debugLevel) {
      return;
    }

    let loggerParams = {
      message,
      method,
      traceId: getTraceId(),
      statusCode: payload?.statusCode,
    };
    let finalPayload = payload !== undefined ? payload : {};
    this.logger.debug(
      ` start ${JSON.stringify(loggerParams)} payload: ${this.customstringify(
        this.sanitizeLog(finalPayload)
      )}==end`
    );
  }
  /**
   * to map log levels and handle from config
   */
  private mapLogLevels() {
    if (config.LOG_LEVELS.length) {
      config.LOG_LEVELS.forEach((element: string) => {
        const logLevel = element.trim();
        if (logLevel === 'info') {
          this.infoLevel = true;
        } else if (logLevel === 'debug') {
          this.debugLevel = true;
        } else if (logLevel === 'error') {
          this.errorLevel = true;
        } else if (logLevel === 'warn') {
          this.warnLevel = true;
        }
      });
    }
  }
  /**
   * to sanitize logs from unwanted fields to be shown
   * @param request
   * @returns
   */
  private sanitizeLog(request: any) {
    try {
      if (request) {
        Object.keys(request).forEach((key) => {
          let value = request[key];
          if (request[key] === 'options') {
            delete request.options;
          } else {
            if (
              this.blockedKeywords.find(
                (blockedKey: any) => key.toLowerCase() === blockedKey.toLowerCase()
              )
            ) {
              request[key] = 'XXXXXXXXXX';
            } else {
              request[key] = value;
            }
          }
        });
        return request;
      }
    } catch (err: any) {
      this.error('Logger sanitize error', err);
    }
  }
}

export const Logger = new LoggerClass();
