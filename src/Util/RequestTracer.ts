import { NextFunction, Request, Response } from 'express';
import { TRACE_ID_HEADER_NAME } from './Constants';
import cls from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';

const nsid = `rtracer:${uuidv4()}`;
const ns = cls.createNamespace(nsid);
const traceIdKey = 'traceId';
const spanIdKey = 'spanId';
/**
 * setTracers - to set the request tracers on the request
 */
export const setTracers = (req: Request, res: Response, next: NextFunction) => {
  const headerName = TRACE_ID_HEADER_NAME.toLocaleLowerCase();
  ns.bindEmitter(req);
  ns.bindEmitter(res);
  const traceId = req.headers[headerName] || uuidv4(); // to be passed in headers
  const spanId = uuidv4(); // will be unique for services

  ns.run(() => {
    ns.set(traceIdKey, traceId);
    ns.set(spanIdKey, spanId);
    next();
  });
};

export const getTraceId = () => ns.get(traceIdKey);
export const getSpanId = () => ns.get(spanIdKey);
