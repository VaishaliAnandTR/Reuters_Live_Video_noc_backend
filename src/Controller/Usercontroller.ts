import { Request, Response } from 'express';
import { throwError } from '../Util/ErrorHandler';
import { HTTP_STATUS_CODE } from '../Util/HttpCodes';
import { Logger } from '../Util/Logger';
import { handleResponse } from '../Util/CommonUtil';

/**
 * changePassword - controller to change password of user after login
 * @param  {Request} req- express http request
 * @param  {Response} res- express http response
 * @return {Response} success or error response
 */
export const userList = async (req: Request, res: Response) => {
  try {
    Logger.info('UserController: Reached changePassword endpoint', 'changePassword');
    let response = [
      {
        name: 'vaishali',
      },
    ];
    if (!response) throwError(`Response' is missing!`, HTTP_STATUS_CODE.BAD_REQUEST);
    handleResponse(res, response, null);
  } catch (err: any) {
    Logger.error('UserController: Error in changePassword endpoint', 'changePassword', err);
    handleResponse(res, null, err, err.code || HTTP_STATUS_CODE.BAD_REQUEST);
  }
};
