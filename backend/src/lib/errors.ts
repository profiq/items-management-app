// this is here due to the fact that the catch decorator in the filter was getting rather crowded
export class BaseCustomException extends Error {}

export class BaseUnknownException extends BaseCustomException {
  constructor(kind: string) {
    super();
    this.message = `The specified ${kind} could not be found`;
  }
}

export class UnknownUserException extends BaseUnknownException {
  constructor() {
    super('user');
  }
}

export class BaseFirebaseException extends BaseCustomException {}

export class UploadException extends BaseFirebaseException {
  constructor(options?: ErrorOptions) {
    super(
      'Could not upload file to the bucket, please retry again later',
      options
    );
  }
}

export class DeleteException extends BaseFirebaseException {
  constructor(options?: ErrorOptions) {
    super(
      'Could not delete file from the bucket, please retry again later',
      options
    );
  }
}

export class BaseUnknownRelatedException extends BaseCustomException {
  constructor(kind: string) {
    super();
    this.message = `The related ${kind} could not be found`;
  }
}
