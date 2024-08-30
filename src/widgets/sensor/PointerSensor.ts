/* eslint-disable @typescript-eslint/unbound-method */
import {
    Coordinates,
    getEventCoordinates,
    getOwnerDocument,
    getWindow,
    subtract as getCoordinatesDelta
} from "@dnd-kit/utilities";

import {
    defaultCoordinates,
    DistanceMeasurement,
    PointerSensorOptions,
    PointerSensorProps,
    SensorInstance
} from "@dnd-kit/core";
import type { PointerEvent } from "react";
import { hasExceededDistance, Listeners } from "./helpers.ts";

enum EventName {
    Click = "click",
    DragStart = "dragstart",
    Keydown = "keydown",
    ContextMenu = "contextmenu",
    SelectionChange = "selectionchange",
    VisibilityChange = "visibilitychange",
}

interface DistanceConstraint {
    distance: DistanceMeasurement;
    tolerance?: DistanceMeasurement;
}

interface DelayConstraint {
    delay: number;
    tolerance: DistanceMeasurement;
}

interface EventDescriptor {
    name: keyof DocumentEventMap;
    passive?: boolean;
}

export interface PointerEventHandlers {
    move: EventDescriptor;
    end: EventDescriptor;
}

export type PointerActivationConstraint =
    | DelayConstraint
    | DistanceConstraint
    | (DelayConstraint & DistanceConstraint);

function isDistanceConstraint(
    constraint: PointerActivationConstraint
): constraint is PointerActivationConstraint & DistanceConstraint {
    return Boolean(constraint && "distance" in constraint);
}

function isDelayConstraint(
    constraint: PointerActivationConstraint
): constraint is DelayConstraint {
    return Boolean(constraint && "delay" in constraint);
}

const events: PointerEventHandlers = {
    move: { name: "pointermove" },
    end: { name: "pointerup" },
};

export class PointerSensor implements SensorInstance {
    static activators = [
        {
            eventName: "onPointerDown" as const,
            handler: (
                { nativeEvent: event }: PointerEvent,
                { onActivation }: PointerSensorOptions
            ) => {
                if (!event.isPrimary || event.button !== 0) {
                    return false;
                }

                onActivation?.({ event });

                return true;
            },
        },
    ];
    public autoScrollEnabled = true;
    private document: Document;
    private activated: boolean = false;
    private initialCoordinates: Coordinates;
    private timeoutId: NodeJS.Timeout | null = null;
    private listeners: Listeners;
    private documentListeners: Listeners;
    private windowListeners: Listeners;
    private events: PointerEventHandlers;

    constructor(
        private props: PointerSensorProps,
    ) {
        const { event } = props;

        const listenerTarget = getOwnerDocument(props.event.target);

        const { target } = event;

        this.props = props;
        this.events = events;
        this.document = getOwnerDocument(target);
        this.documentListeners = new Listeners(this.document);
        this.listeners = new Listeners(listenerTarget);
        this.windowListeners = new Listeners(getWindow(target));
        this.initialCoordinates = getEventCoordinates(event) ?? defaultCoordinates;
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.removeTextSelection = this.removeTextSelection.bind(this);

        this.attach();
    }

    private attach() {
        const {
            events,
            props: {
                options: { activationConstraint, bypassActivationConstraint },
            },
        } = this;

        this.listeners.add(events.move.name, this.handleMove, { passive: false });
        this.listeners.add(events.end.name, this.handleEnd);
        this.windowListeners.add(EventName.DragStart, (event) => event.preventDefault);
        this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
        this.windowListeners.add(EventName.ContextMenu, (event) => event.preventDefault);
        this.documentListeners.add(EventName.Keydown, this.handleKeydown);

        if (activationConstraint) {
            if (
                bypassActivationConstraint?.({
                    event: this.props.event,
                    activeNode: this.props.activeNode,
                    options: this.props.options,
                })
            ) {
                return this.handleStart();
            }

            if (isDelayConstraint(activationConstraint)) {
                this.timeoutId = setTimeout(
                    this.handleStart,
                    activationConstraint.delay
                );
                return;
            }

            if (isDistanceConstraint(activationConstraint)) {
                return;
            }
        }

        this.handleStart();
    }

    private detach() {
        this.listeners.removeAll();
        this.windowListeners.removeAll();

        // Wait until the next event loop before removing document listeners
        // This is necessary because we listen for `click` and `selection` events on the document
        setTimeout(this.documentListeners.removeAll, 50);

        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private handleStart() {
        const { initialCoordinates } = this;
        const { onStart } = this.props;

        if (initialCoordinates) {
            this.activated = true;

            // Stop propagation of click events once activation constraints are met
            this.documentListeners.add(EventName.Click, (event) => event.stopPropagation(), {
                capture: true,
            });

            // Remove any text selection from the document
            this.removeTextSelection();

            // Prevent further text selection while dragging
            this.documentListeners.add(
                EventName.SelectionChange,
                this.removeTextSelection
            );

            onStart(initialCoordinates);
        }
    }

    private handleMove(event: Event) {
        const { activated, initialCoordinates, props } = this;
        const {
            onMove,
            options: { activationConstraint },
        } = props;

        if (!initialCoordinates) {
            return;
        }

        const coordinates = getEventCoordinates(event) ?? defaultCoordinates;
        const delta = getCoordinatesDelta(initialCoordinates, coordinates);

        // Constraint validation
        if (!activated && activationConstraint) {
            if (isDistanceConstraint(activationConstraint)) {
                if (
                    activationConstraint.tolerance != null &&
                    hasExceededDistance(delta, activationConstraint.tolerance)
                ) {
                    return this.handleCancel();
                }

                if (hasExceededDistance(delta, activationConstraint.distance)) {
                    return this.handleStart();
                }
            }

            if (isDelayConstraint(activationConstraint)) {
                if (hasExceededDistance(delta, activationConstraint.tolerance)) {
                    return this.handleCancel();
                }
            }

            return;
        }

        if (event.cancelable) {
            event.preventDefault();
        }

        onMove(coordinates);
    }

    private handleEnd() {
        const { onEnd } = this.props;

        this.detach();
        onEnd();
    }

    private handleCancel() {
        const { onCancel } = this.props;

        this.detach();
        onCancel();
    }

    private handleKeydown(event: KeyboardEvent) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (event.code === "Escape") {
            this.handleCancel();
        }
    }

    private removeTextSelection() {
        this.document.getSelection()?.removeAllRanges();
    }
}
