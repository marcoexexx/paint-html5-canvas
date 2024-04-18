export const ErrorKind = {
    CanvasNotFoundError: "CanvasNotFoundError",
    ElementIdNotFoundError: "ElementIdNotFoundError",
    ParentElementNotFoundError: "ParentElementNotFoundError",
    NotImplementedError: "NotImplementedError",
};
export class AppError extends Error {
    constructor(kind, message) {
        super(`${message}: ${kind}`);
        this.kind = kind;
    }
    static new(kind, message = "Unknown error") {
        return new AppError(kind, message);
    }
}
