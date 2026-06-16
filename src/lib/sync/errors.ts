export class SyncAuthError extends Error {
  readonly status = 401;

  constructor(message: string) {
    super(message);
    this.name = "SyncAuthError";
  }
}

export class SyncForbiddenError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "SyncForbiddenError";
  }
}

export class SyncNotFoundError extends Error {
  readonly status = 404;

  constructor(message: string) {
    super(message);
    this.name = "SyncNotFoundError";
  }
}

export class SyncValidationError extends Error {
  readonly status = 400;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(message: string, issues: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "SyncValidationError";
    this.issues = issues;
  }
}
