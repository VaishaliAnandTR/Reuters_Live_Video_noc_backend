import { NextFunction, Request, Response } from 'express';
import { throwError } from '../Util/ErrorHandler';
import { HTTP_STATUS_CODE, HTTP_STATUS_TYPE } from '../Util/HttpCodes';
import { Logger } from '../Util/Logger';
const trustedOrigins = ['http://localhost:8089', 'https://another-trusted-domain.com'];

// Middleware to check Referer/Origin headers
export const checkRefererOrigin = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  Logger.info(
    'commonMiddleware: Reached checkRefererOriginMiddleware',
    'checkRefererOriginMiddleware'
  );
  // Check if the request has a valid Referer or Origin header
  if (referer && trustedOrigins.some((domain) => referer.startsWith(domain))) {
    next();
  }

  if (origin && trustedOrigins.includes(origin)) {
    next();
  }

  throwError(
    'Invalid referer or origin.',
    HTTP_STATUS_CODE.UNAUTHORIZED,
    HTTP_STATUS_TYPE.UNAUTHORIZED
  );
};
