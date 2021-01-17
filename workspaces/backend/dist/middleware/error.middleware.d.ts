import HttpException from '../common/httpException';
import { Request, Response } from 'express';
export declare const errorHandler: (error: HttpException, request: Request, response: Response) => void;
