import { AppError, ErrorKind } from "./error.js";

export interface ElementInput {
  tagName: string;
  style?: Partial<CSSStyleDeclaration>;
  innerProps?: Partial<HTMLElement | HTMLImageElement> & {
    [key: `data-${string}`]: string;
  };
}

export function createElement(
  parentQuery: string,
  elementInput: ElementInput,
) {
  const root = window.document.querySelector(parentQuery);
  const element = window.document.createElement(elementInput.tagName);

  if (!root) throw AppError.new(ErrorKind.ParentElementNotFoundError);

  Object.assign(element.style, elementInput.style);

  if (
    elementInput?.innerProps?.classList
    && elementInput.innerProps.classList.length > 0
  ) {
    elementInput.innerProps.classList.forEach(className =>
      element.classList.add(className)
    );
  }

  if (elementInput.innerProps) {
    Object.keys(elementInput.innerProps).forEach(attr => {
      if (attr !== "classList") {
        // @ts-ignore
        element.setAttribute(attr, elementInput.innerProps[attr]);
      }
    });
  }

  root.appendChild(element);
  return element;
}
