import { HTTP_STATUS_CODE, HTTP_STATUS_MAP, HTTP_STATUS_TYPE } from './HttpCodes';

export class CommonErrorTemplate extends Error {
  public code: number;
  public type: string;

  constructor(msg: string, code?: number) {
    super(msg);
    this.code = code || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    this.type = HTTP_STATUS_MAP.get(this.code) || HTTP_STATUS_TYPE.INTERNAL_SERVER_ERROR;
  }
}

export class ApiError extends CommonErrorTemplate {
  constructor(msg: string, code?: number) {
    super(msg, code);
    this.name = 'ApiError';
    Error.captureStackTrace(this, ApiError);
  }
}

export class CustomError {
  public code!: number | undefined;
  public type!: string | undefined;
  public message!: string | undefined;
  public stack!: string | undefined;
  public errorObj: Error | undefined | null;

  constructor(errObj?: any, code?: number, type?: string, message?: string, stack?: string) {
    this.code = code;
    this.type = type;
    this.message = message;
    this.stack = stack;
    this.errorObj = errObj;
  }

  public toJSON() {
    return {
      code: this.code,
      type: this.type,
      message: this.message,
    };
  }
}
/**
 * errorMapper - to map error object to custom error
 */
export const errorMapper = (err: any, statusCode?: number, type?: string) => {
  let error!: any;
  let customError: CustomError;
  let code: number = statusCode || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
  let errorType: string =
    type || HTTP_STATUS_MAP.get(code) || HTTP_STATUS_TYPE.INTERNAL_SERVER_ERROR;

  if (typeof err === 'string') {
    error = new Error(err);
    customError = new CustomError(null, code, errorType, error.message, error.stack);
    return customError;
  } else if (err.stack && err.message && !(err instanceof CustomError) && !err.toJSON) {
    customError = new CustomError(null, code, errorType, err.message, err.stack);
    return customError;
  } else {
    return err;
  }
};
/**
 * throwError - to throw custome error
 */
export const throwError = (err: any, statusCode?: number, type?: string) => {
  throw errorMapper(err, statusCode, type);
};
