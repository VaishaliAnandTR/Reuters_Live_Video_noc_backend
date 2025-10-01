import requestIp from 'request-ip';
import config from '../Config/index';
import { getTraceId, setTracers } from '../Util/RequestTracer';
import helmet from 'helmet';
import cors from 'cors';
import express, { NextFunction, Request, Response, Express } from 'express';
import { HTTP_STATUS_CODE } from '../Util/HttpCodes';
import swaggerUI from 'swagger-ui-express';

import { handleResponse } from '../Util/CommonUtil';
import { Logger } from '../Util/Logger';
import { limiter } from './ratelimitMiddleware';
import { checkRefererOrigin } from './originrefererMiddleware';
import swaggerSpec from '../Util/Swagger';

/**
 * traceMiddleware - middleware to add spanid and traceid into requests
 */
export const traceMiddleware = setTracers;
/**
 * traceIdHeaderMiddleware- to add x-traceid in response for tracking
 * @param req
 * @param res
 * @param next
 */
const traceIdHeaderMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const traceId = getTraceId();
  if (traceId) {
    res.setHeader('X-Trace-Id', getTraceId());
  }
  next();
};
/**
 * to init common middlewares
 * @param app
 * @returns
 */
export const initCommonMiddlewares = async (app: Express) => {
  Logger.info('commonMiddleware: Reached initCommonMiddlewares', 'initCommonMiddlewares');
  const corsOptions = {
    origin: config.CORS.ORIGIN,
    credentials: config.CORS.CREDENTIALS, // required to set cookie for cross origin
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.x_forwarded_proto) {
      req.headers['x-forwarded-proto'] = req.headers.x_forwarded_proto;
    }
    next();
  });
  app.set('trust proxy', 1);
  app.use(requestIp.mw());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Only allow content from the same origin
          scriptSrc: ["'self'"], // Allow only scripts from the same origin
          styleSrc: ["'self'"], // Allow only styles from the same origin
          objectSrc: ["'none'"], // Prevent object/embed tags
          imgSrc: ["'self'"], // Allow images from the same origin
          connectSrc: ["'self'"], // Allow connections (e.g., AJAX requests) to the same origin
          fontSrc: ["'self'"], // Allow fonts from the same origin
          frameSrc: ["'none'"], // Prevent embedding in frames
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'sameorigin' },
      noSniff: true,
      xssFilter: true,
    })
  );

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '50mb' }));
  app.use(traceMiddleware);
  app.use(traceIdHeaderMiddleware);
  app.use(limiter);
  // app.use(checkRefererOrigin);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  // unhandled error exception handling to be implemented
  // should be last middleware always
  app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    handleResponse(res, null, err, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
  });
  return app;
};
