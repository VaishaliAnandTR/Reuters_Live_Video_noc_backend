import { Request, Response } from 'express';
import { CustomError, errorMapper } from './ErrorHandler';
import { Logger } from './Logger';
import { HTTP_STATUS_CODE } from './HttpCodes';
import { ROUTES_URL } from './Constants';
/**
 * handleErrorResponse - error handler
 * @param  {object} err- error object
 */
const handleErrorResponse = (err: any) => {
  if (!err) {
    return undefined;
  } else {
    return errorMapper(err).toJSON();
  }
};

export const customErrorHandler = (res: any, code: any, status: string, data: any, error: any) => {
  return res.status(200).json({
    code,
    status,
    data,
    error: error || 'Something went wrong!',
  });
};

/**
 * handleResponse - response handler to create standard response
 * @param {object} res- express Response
 * @param {object} data- data param
 * @param {object} err- err object
 * @param {number} status- http status
 */
export const handleResponse = (
  res: Response,
  data: object | null,
  err: CustomError | Error | null | undefined,
  status?: number,
  errors?: any
) => {
  Logger.info(`Reached handleResponse method`, 'handleResponse');
  let code;
  if (!err) {
    code = status || HTTP_STATUS_CODE.OK;
  } else {
    code = status || (err as any).code || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
  }
  const response = {
    code,
    errors,
    status: !err ? 'success' : 'error',
    data: !err ? (data ? data : null) : null,
    error: handleErrorResponse(err),
  };
  Logger.debug('Response', 'handleResponse', response);
  res.status(code).send(response);
};

/**
 * Function for get rest api resource name map into exits routes
 * @param originalUrl
 * @returns resource
 */
export const getRestAPIResourceName = (originalUrl: string) => {
  let resource: any = '';
  for (const key in ROUTES_URL) {
    if (Object.prototype.hasOwnProperty.call(ROUTES_URL, key)) {
      const element: string = ROUTES_URL[key];
      if (element === originalUrl) {
        resource = key;
      }
    }
  }
  return resource;
};
