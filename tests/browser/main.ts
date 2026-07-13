import { createApp } from 'vue';
import TestApp from './TestApp.vue';
import '../../src/styles/index.css';

declare global {
  interface Window {
    __mediaListenerCount: number;
    __popoverListenerCount: number;
  }
}

window.__mediaListenerCount = 0;
window.__popoverListenerCount = 0;

const nativeMatchMedia = window.matchMedia.bind(window);
window.matchMedia = query => {
  const mediaQuery = nativeMatchMedia(query);
  const listeners = new Set<EventListenerOrEventListenerObject>();
  return new Proxy(mediaQuery, {
    get(target, property) {
      if (property === 'addEventListener') {
        return (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: AddEventListenerOptions | boolean,
        ) => {
          if (type === 'change' && !listeners.has(listener)) {
            listeners.add(listener);
            window.__mediaListenerCount++;
          }
          target.addEventListener(type, listener, options);
        };
      }
      if (property === 'removeEventListener') {
        return (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: EventListenerOptions | boolean,
        ) => {
          if (type === 'change' && listeners.delete(listener)) {
            window.__mediaListenerCount--;
          }
          target.removeEventListener(type, listener, options);
        };
      }
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
};

const popoverEvents = new Set([
  'keydown',
  'pointerdown',
  'show-popover',
  'hide-popover',
  'toggle-popover',
]);
const nativeAddEventListener = Document.prototype.addEventListener;
const nativeRemoveEventListener = Document.prototype.removeEventListener;
Document.prototype.addEventListener = function (
  this: Document,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) {
  if (popoverEvents.has(type)) window.__popoverListenerCount++;
  nativeAddEventListener.call(this, type, listener, options);
} as Document['addEventListener'];
Document.prototype.removeEventListener = function (
  this: Document,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | boolean,
) {
  if (popoverEvents.has(type)) window.__popoverListenerCount--;
  nativeRemoveEventListener.call(this, type, listener, options);
} as Document['removeEventListener'];

createApp(TestApp).mount('#app');
