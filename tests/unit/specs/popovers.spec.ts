import { hidePopover, popoverDirective, showPopover } from '@/utils/popovers';
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
import type { ObjectDirective } from 'vue';

const directive = popoverDirective as ObjectDirective;

describe('popover document ownership', () => {
  it('dispatches events in the trigger owner document', () => {
    const frame = new JSDOM('<!doctype html><button id="trigger"></button>');
    const trigger = frame.window.document.querySelector('#trigger')!;
    let currentDocumentEvents = 0;
    let frameDocumentEvents = 0;
    document.addEventListener('show-popover', () => currentDocumentEvents++, {
      once: true,
    });
    frame.window.document.addEventListener(
      'show-popover',
      () => frameDocumentEvents++,
      { once: true },
    );

    showPopover({ id: 'frame', target: trigger });

    expect(currentDocumentEvents).toBe(0);
    expect(frameDocumentEvents).toBe(1);
  });

  it('is safe when no browser document exists', () => {
    vi.stubGlobal('document', undefined);
    expect(() => showPopover({ id: 'ssr' })).not.toThrow();
    expect(() => hidePopover({ id: 'ssr' })).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('hides an open popover when its directive trigger unmounts', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    let hideEvents = 0;
    document.addEventListener('hide-popover', () => hideEvents++, {
      once: true,
    });

    const binding = {
      value: { id: 'removed', visibility: 'click' },
    } as never;
    directive.mounted!(
      trigger,
      binding,
      undefined as never,
      undefined as never,
    );
    trigger.click();
    directive.unmounted!(
      trigger,
      binding,
      undefined as never,
      undefined as never,
    );
    trigger.remove();

    expect(hideEvents).toBe(1);
  });
});
