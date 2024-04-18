import { AppError, ErrorKind } from "./error.js";
export function createElement(parentQuery, elementInput) {
    var _a;
    const root = window.document.querySelector(parentQuery);
    const element = window.document.createElement(elementInput.tagName);
    if (!root)
        throw AppError.new(ErrorKind.ParentElementNotFoundError);
    Object.assign(element.style, elementInput.style);
    if (((_a = elementInput === null || elementInput === void 0 ? void 0 : elementInput.innerProps) === null || _a === void 0 ? void 0 : _a.classList)
        && elementInput.innerProps.classList.length > 0) {
        elementInput.innerProps.classList.forEach(className => element.classList.add(className));
    }
    if (elementInput.innerProps) {
        Object.keys(elementInput.innerProps).forEach(attr => {
            if (attr !== "classList") {
                element.setAttribute(attr, elementInput.innerProps[attr]);
            }
        });
    }
    root.appendChild(element);
    return element;
}
