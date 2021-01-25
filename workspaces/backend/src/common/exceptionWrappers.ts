import { HttpException, HttpStatus } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';

export const internalServerError = (error): HttpException => {
  return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
};

export const noAccessOrDoesNotExistError = (): HttpException => {
  return new HttpException(
    'Resource does not exist or you do not have access to it',
    HttpStatus.NOT_FOUND,
  );
};

export const mongooseValidationError = (
  err: MongooseError.ValidationError,
): HttpException => {
  const error = {
    errors: {},
  };
  Object.keys(err.errors).map(
    (key: string) =>
      (error.errors[key] = {
        kind: err.errors[key].kind,
      }),
  );

  return new HttpException(
    {
      message: 'Validation Error',
      status: HttpStatus.BAD_REQUEST,
      error,
    },
    HttpStatus.BAD_REQUEST,
  );
};

export const invalidValuesError = (): HttpException => {
  return new HttpException(
    {
      message: 'Invalid or incorrect values provided',
      status: HttpStatus.BAD_REQUEST,
    },
    HttpStatus.BAD_REQUEST,
  );
};

export const handleHttpRequestError = (err): HttpException => {
  // console.log(err);
  switch (err.name) {
    case MongooseError.ValidationError.name:
      throw mongooseValidationError(err);
    case MongooseError.DocumentNotFoundError.name:
      throw noAccessOrDoesNotExistError();
    case MongooseError.CastError.name:
      throw invalidValuesError();
    default:
      throw internalServerError(err);
  }
};
