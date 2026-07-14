import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import packageJson from '../../../package.json';
import { propsDef as calendarPropsDef } from '../../../src/use/calendar';
import { propsDef as datePickerPropsDef } from '../../../src/use/datePicker';
import webTypes from '../../../web-types.json';

type WebTypesComponent = {
  name: string;
  extends?: string;
  props?: Array<{ name: string }>;
  source?: { file: string; offset: number };
};

const components = webTypes.contributions.html[
  'vue-components'
] as WebTypesComponent[];

const component = (name: string) =>
  components.find(candidate => candidate.name === name);

describe('JetBrains Web Types metadata', () => {
  it('matches the published package identity', () => {
    expect(webTypes.name).toBe(packageJson.name);
    expect(webTypes.version).toBe(packageJson.version);
    expect(packageJson['web-types']).toBe('./web-types.json');
    expect(packageJson.files).toContain('web-types.json');
  });

  it('describes every public Calendar and DatePicker prop', () => {
    expect(
      component('Calendar')
        ?.props?.map(prop => prop.name)
        .sort(),
    ).toEqual(Object.keys(calendarPropsDef).sort());
    expect(
      component('DatePicker')
        ?.props?.map(prop => prop.name)
        .sort(),
    ).toEqual(Object.keys(datePickerPropsDef).sort());
  });

  it('links components and their global aliases to shipped source files', () => {
    for (const name of [
      'Calendar',
      'VCalendar',
      'DatePicker',
      'VDatePicker',
      'Popover',
      'VPopover',
      'PopoverRow',
      'VPopoverRow',
    ]) {
      const metadata = component(name);
      expect(metadata, `${name} metadata is missing`).toBeDefined();
      expect(metadata?.source, `${name} source is missing`).toBeDefined();
      expect(
        existsSync(resolve(process.cwd(), metadata?.source?.file ?? '')),
        `${name} source file does not exist`,
      ).toBe(true);
    }

    expect(component('VCalendar')?.extends).toBe(
      '/html/vue-components/Calendar',
    );
    expect(component('VDatePicker')?.extends).toBe(
      '/html/vue-components/DatePicker',
    );
  });
});
