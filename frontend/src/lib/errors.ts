import { StatusCodes } from 'http-status-codes';

export type MessageOverride = {
  status_code: number;
  message: string;
};

export class GenericError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = message ?? 'Could not fetch the data! An error occured';
    this.name = 'GenericError';
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = message ?? `Could not find the request data`;
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = message ?? `Forbidden`;
    this.name = 'ForbiddenError';
  }
}

export class BadRequestError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = message ?? `You have sent a bad request`;
    this.name = 'BadRequestError';
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message?: string) {
    super(message);
    this.message =
      message ?? `Service is unavailable, please retry again later`;
    this.name = 'ServiceUnavailableError';
  }
}

export function createError(status_code: StatusCodes, message?: string): Error {
  let error = new GenericError();
  switch (status_code) {
    case StatusCodes.NOT_FOUND:
      error = new NotFoundError(message);
      break;
    case StatusCodes.BAD_REQUEST:
      error = new BadRequestError(message);
      break;
    case StatusCodes.FORBIDDEN:
      error = new ForbiddenError(message);
      break;
    case StatusCodes.SERVICE_UNAVAILABLE:
      error = new ServiceUnavailableError(message);
      break;
  }
  return error;
}
