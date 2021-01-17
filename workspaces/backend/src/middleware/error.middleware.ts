import HttpException from '../common/httpException';
import { Request, Response } from 'express';

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
) => {
  const status = error.statusCode || error.status || 500;

  response.status(status).send(error);
};
