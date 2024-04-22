export declare const ErrorKind: {
    readonly CanvasNotFoundError: "CanvasNotFoundError";
    readonly ElementIdNotFoundError: "ElementIdNotFoundError";
    readonly ParentElementNotFoundError: "ParentElementNotFoundError";
    readonly NotImplementedError: "NotImplementedError";
};
export type ErrorKind = typeof ErrorKind[keyof typeof ErrorKind];
export declare class AppError extends Error {
    kind: ErrorKind;
    constructor(kind: ErrorKind, message?: string);
    static new(kind: ErrorKind, message?: string): AppError;
}
