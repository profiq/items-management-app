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
  constructor() {
    super();
    this.message =
      'Could not upload file to the bucket, please retry again later';
  }
}

export class DeleteException extends BaseFirebaseException {
  constructor() {
    super();
    this.message =
      'Could not delete file from the bucket, please retry again later';
  }
}

export class BaseUnknownRelatedException extends BaseCustomException {
  constructor(kind: string) {
    super();
    this.message = `The related ${kind} could not be found`;
  }
}
