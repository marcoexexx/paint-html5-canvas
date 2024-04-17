export const ErrorKind = {
  CanvasNotFoundError: "CanvasNotFoundError",
  ElementIdNotFoundError: "ElementIdNotFoundError",
  ParentElementNotFoundError: "ParentElementNotFoundError",
  NotImplementedError: "NotImplementedError",
} as const;
export type ErrorKind = typeof ErrorKind[keyof typeof ErrorKind];

export class AppError extends Error {
  constructor(public kind: ErrorKind, message?: string) {
    super(`${message}: ${kind}`);
  }

  static new(kind: ErrorKind, message: string = "Unknown error") {
    return new AppError(kind, message);
  }
}
