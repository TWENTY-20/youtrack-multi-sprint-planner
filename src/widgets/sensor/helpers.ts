import type { ClientRect, DistanceMeasurement } from "@dnd-kit/core";
import {
    canUseDOM,
    Coordinates,
    getWindow,
    isDocument,
    isHTMLElement,
    isSVGElement,
    Transform
} from "@dnd-kit/utilities";

export function hasExceededDistance(
    delta: Coordinates,
    measurement: DistanceMeasurement
): boolean {
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);

    if (typeof measurement === "number") {
        return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
    }

    if ("x" in measurement && "y" in measurement) {
        return dx > measurement.x && dy > measurement.y;
    }

    if ("x" in measurement) {
        return dx > measurement.x;
    }

    if ("y" in measurement) {
        return dy > measurement.y;
    }

    return false;
}

export class Listeners {
    private listeners: [
        string,
        EventListenerOrEventListenerObject,
            AddEventListenerOptions | boolean | undefined
    ][] = [];

    constructor(private target: EventTarget | null) {
    }

    public add<T extends Event>(
        eventName: string,
        handler: (event: T) => void,
        options?: AddEventListenerOptions | boolean
    ) {
        this.target?.addEventListener(eventName, handler as EventListener, options);
        this.listeners.push([eventName, handler as EventListener, options]);
    }

    public removeAll = () => {
        this.listeners.forEach((listener) =>
            this.target?.removeEventListener(...listener)
        );
    };
}

export function getScrollElementRect(element: Element) {
    if (element === document.scrollingElement) {
        const { innerWidth, innerHeight } = window;

        return {
            top: 0,
            left: 0,
            right: innerWidth,
            bottom: innerHeight,
            width: innerWidth,
            height: innerHeight,
        };
    }

    const { top, left, right, bottom } = element.getBoundingClientRect();

    return {
        top,
        left,
        right,
        bottom,
        width: element.clientWidth,
        height: element.clientHeight,
    };
}

export function isDocumentScrollingElement(element: Element | null) {
    if (!canUseDOM || !element) {
        return false;
    }

    return element === document.scrollingElement;
}

export function getScrollPosition(scrollingContainer: Element) {
    const minScroll = {
        x: 0,
        y: 0,
    };
    const dimensions = isDocumentScrollingElement(scrollingContainer)
        ? {
            height: window.innerHeight,
            width: window.innerWidth,
        }
        : {
            height: scrollingContainer.clientHeight,
            width: scrollingContainer.clientWidth,
        };
    const maxScroll = {
        x: scrollingContainer.scrollWidth - dimensions.width,
        y: scrollingContainer.scrollHeight - dimensions.height,
    };

    const isTop = scrollingContainer.scrollTop <= minScroll.y;
    const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
    const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
    const isRight = scrollingContainer.scrollLeft >= maxScroll.x;

    return {
        isTop,
        isLeft,
        isBottom,
        isRight,
        maxScroll,
        minScroll,
    };
}

export function parseTransform(transform: string): Transform | null {
    if (transform.startsWith("matrix3d(")) {
        const transformArray = transform.slice(9, -1).split(/, /);

        return {
            x: +transformArray[12],
            y: +transformArray[13],
            scaleX: +transformArray[0],
            scaleY: +transformArray[5],
        };
    } else if (transform.startsWith("matrix(")) {
        const transformArray = transform.slice(7, -1).split(/, /);

        return {
            x: +transformArray[4],
            y: +transformArray[5],
            scaleX: +transformArray[0],
            scaleY: +transformArray[3],
        };
    }

    return null;
}

export function inverseTransform(
    rect: ClientRect,
    transform: string,
    transformOrigin: string
): ClientRect {
    const parsedTransform = parseTransform(transform);

    if (!parsedTransform) {
        return rect;
    }

    const { scaleX, scaleY, x: translateX, y: translateY } = parsedTransform;

    const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
    const y =
        rect.top -
        translateY -
        (1 - scaleY) *
        parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
    const w = scaleX ? rect.width / scaleX : rect.width;
    const h = scaleY ? rect.height / scaleY : rect.height;

    return {
        width: w,
        height: h,
        top: y,
        right: x + w,
        bottom: y + h,
        left: x,
    };
}

interface Options {
    ignoreTransform?: boolean;
}

const defaultOptions: Options = { ignoreTransform: false };

export function getClientRect(
    element: Element,
    options: Options = defaultOptions
) {
    let rect: ClientRect = element.getBoundingClientRect();

    if (options.ignoreTransform) {
        const { transform, transformOrigin } =
            getWindow(element).getComputedStyle(element);

        if (transform) {
            rect = inverseTransform(rect, transform, transformOrigin);
        }
    }

    const { top, left, width, height, bottom, right } = rect;

    return {
        top,
        left,
        width,
        height,
        bottom,
        right,
    };
}

export function isScrollable(
    element: HTMLElement,
    computedStyle: CSSStyleDeclaration = getWindow(element).getComputedStyle(
        element
    )
): boolean {
    const overflowRegex = /(auto|scroll|overlay)/;
    const properties = ["overflow", "overflowX", "overflowY"];

    return properties.some((property) => {
        const value = computedStyle[property as keyof CSSStyleDeclaration];

        return typeof value === "string" ? overflowRegex.test(value) : false;
    });
}

export function isFixed(
    node: HTMLElement,
    computedStyle: CSSStyleDeclaration = getWindow(node).getComputedStyle(node)
): boolean {
    return computedStyle.position === "fixed";
}

export function getScrollableAncestors(
    element: Node | null,
    limit?: number
): Element[] {
    const scrollParents: Element[] = [];

    function findScrollableAncestors(node: Node | null): Element[] {
        if (limit != null && scrollParents.length >= limit) {
            return scrollParents;
        }

        if (!node) {
            return scrollParents;
        }

        if (
            isDocument(node) &&
            node.scrollingElement != null &&
            !scrollParents.includes(node.scrollingElement)
        ) {
            scrollParents.push(node.scrollingElement);

            return scrollParents;
        }

        if (!isHTMLElement(node) || isSVGElement(node)) {
            return scrollParents;
        }

        if (scrollParents.includes(node)) {
            return scrollParents;
        }

        const computedStyle = getWindow(element).getComputedStyle(node);

        if (node !== element) {
            if (isScrollable(node, computedStyle)) {
                scrollParents.push(node);
            }
        }

        if (isFixed(node, computedStyle)) {
            return scrollParents;
        }

        return findScrollableAncestors(node.parentNode);
    }

    if (!element) {
        return scrollParents;
    }

    return findScrollableAncestors(element);
}

export function getFirstScrollableAncestor(node: Node | null): Element | null {
    const [firstScrollableAncestor] = getScrollableAncestors(node, 1);

    return firstScrollableAncestor ?? null;
}

export function scrollIntoViewIfNeeded(
    element: HTMLElement | null | undefined,
    measure: (node: HTMLElement) => ClientRect = getClientRect
) {
    if (!element) {
        return;
    }

    const { top, left, bottom, right } = measure(element);
    const firstScrollableAncestor = getFirstScrollableAncestor(element);

    if (!firstScrollableAncestor) {
        return;
    }

    if (
        bottom <= 0 ||
        right <= 0 ||
        top >= window.innerHeight ||
        left >= window.innerWidth
    ) {
        element.scrollIntoView({
            block: "center",
            inline: "center",
        });
    }
}
