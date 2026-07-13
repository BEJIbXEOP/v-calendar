import { isFunction, off, on } from './helpers';
import type { CustomElement } from './helpers';

interface SwipeHandlerOptions {
  maxSwipeTime: number;
  minHorizontalSwipeDistance: number;
  maxVerticalSwipeDistance: number;
}

export const addHorizontalSwipeHandler = (
  element: CustomElement,
  handler: Function,
  {
    maxSwipeTime,
    minHorizontalSwipeDistance,
    maxVerticalSwipeDistance,
  }: SwipeHandlerOptions,
) => {
  if (!element || !element.addEventListener || !isFunction(handler)) {
    return null;
  }
  // State variables
  let startX = 0;
  let startY = 0;
  let startTime: number | null = null;
  let isSwiping = false;
  function pointerStart(event: PointerEvent) {
    if (!event.isPrimary || event.pointerType === 'mouse') return;
    startX = event.screenX;
    startY = event.screenY;
    startTime = Date.now();
    isSwiping = true;
  }

  function pointerEnd(event: PointerEvent) {
    if (!isSwiping || !startTime) return;
    isSwiping = false;
    const deltaX = event.screenX - startX;
    const deltaY = event.screenY - startY;
    const deltaTime = Date.now() - startTime;
    if (deltaTime < maxSwipeTime) {
      if (
        Math.abs(deltaX) >= minHorizontalSwipeDistance &&
        Math.abs(deltaY) <= maxVerticalSwipeDistance
      ) {
        const arg = { toLeft: false, toRight: false };
        if (deltaX < 0) {
          // Swipe to the left
          arg.toLeft = true;
        } else {
          // Swipe to the right
          arg.toRight = true;
        }
        handler(arg);
      }
    }
  }

  function pointerCancel() {
    isSwiping = false;
  }

  on(element, 'pointerdown', pointerStart, { passive: true });
  on(element, 'pointerup', pointerEnd, { passive: true });
  on(element, 'pointercancel', pointerCancel, { passive: true });

  return () => {
    off(element, 'pointerdown', pointerStart);
    off(element, 'pointerup', pointerEnd);
    off(element, 'pointercancel', pointerCancel);
  };
};
