# v-calendar-3

A maintained Vue 3 calendar and date picker with TypeScript declarations,
timezone support, keyboard navigation, touch interaction, and responsive theme
handling.

Current version: `1.1.0`

## Features

- Monthly, weekly, and daily calendar views
- Single-date, range, date-time, and time selection
- Date attributes, highlights, dots, bars, popovers, and disabled dates
- Locale-aware formatting and IANA timezone conversion
- Strict ISO date parsing without UTC shifts for `YYYY-MM-DD` values
- Explicit light/dark themes and automatic system-theme updates
- Keyboard navigation, Escape handling, Pointer Events, and touch support
- SSR-safe browser access and iframe-aware theme/popover handling
- ESM, Node ESM, CommonJS, IIFE, CSS, and TypeScript declaration builds

## Requirements

| Dependency | Supported version |
| --- | --- |
| Vue | `^3.5.16` |
| `@popperjs/core` | `^2.11.8` |
| Node.js for development | `^20.19.0 || >=22.12.0` |

## Installation

```sh
npm install v-calendar-3 @popperjs/core
```

The stylesheet is a separate package export and must be imported once by the
application.

```ts
import 'v-calendar-3/style.css';
```

## Global plugin setup

The default plugin registers `VCalendar`, `VDatePicker`, `VPopover`, and
`VPopoverRow`.

```ts
// main.ts
import { createApp } from 'vue';
import VCalendar from 'v-calendar-3';
import 'v-calendar-3/style.css';
import App from './App.vue';

const app = createApp(App);

app.use(VCalendar, {
  color: 'blue',
  isDark: 'system',
});

app.mount('#app');
```

```vue
<script setup lang="ts">
import { ref } from 'vue';

const selectedDate = ref<Date | null>(new Date());
</script>

<template>
  <VCalendar />
  <VDatePicker v-model="selectedDate" />
</template>
```

The component prefix defaults to `V` and can be changed during plugin setup.

```ts
app.use(VCalendar, {
  componentPrefix: 'App',
});

// Registers AppCalendar, AppDatePicker, AppPopover, and AppPopoverRow.
```

## Local component setup

Components can be imported without installing the global plugin.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Calendar, DatePicker } from 'v-calendar-3';
import 'v-calendar-3/style.css';

const selectedDate = ref<Date | null>(new Date());
const range = ref({
  start: new Date(2026, 6, 13),
  end: new Date(2026, 6, 17),
});

const attributes = [
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
];
</script>

<template>
  <Calendar :attributes="attributes" />
  <DatePicker v-model="selectedDate" />
  <DatePicker v-model.range="range" :rows="2" />
</template>
```

Application-wide defaults can still be installed separately.

```ts
import { setupCalendar } from 'v-calendar-3';

app.use(setupCalendar, {
  color: 'indigo',
  titlePosition: 'left',
});
```

## Date picker modes

The default model is a JavaScript `Date`. Use the `range` modifier for date
ranges and the `mode` prop when time selection is required.

```vue
<DatePicker v-model="date" />
<DatePicker v-model.range="range" />
<DatePicker v-model="dateTime" mode="dateTime" is24hr />
<DatePicker v-model="time" mode="time" is24hr />
```

`rows="2"` with the default `columns="1"` is the two-month period layout. It
renders both months horizontally with a complete navigation header and a
month/year picker on each pane. The displayed months remain consecutive, and
each pane includes muted leading and trailing dates from adjacent months so its
week rows are complete. With `trim-weeks`, both period panes are balanced to the
larger visible week count.

The `string` and `number` model modifiers are also supported. Numeric values use
JavaScript timestamp milliseconds.

```vue
<DatePicker v-model.string="isoDate" />
<DatePicker v-model.number="timestamp" />
```

## Custom input

Provide the default slot to connect the date picker to an application-owned
input. The supplied event object handles parsing, debouncing, focus, and popover
visibility.

```vue
<DatePicker v-model="selectedDate">
  <template #default="{ inputValue, inputEvents }">
    <input
      :value="inputValue"
      v-on="inputEvents"
      aria-label="Select date"
    />
  </template>
</DatePicker>
```

For a range picker, `inputValue` and `inputEvents` contain separate `start` and
`end` properties.

## Bounds and disabled dates

`min-date`, `max-date`, `disabled-dates`, and attribute dates accept native
`Date` values, JavaScript timestamps, and supported ISO strings.

```vue
<Calendar
  min-date="2026-01-01"
  max-date="2026-12-31"
  :disabled-dates="[
    '2026-12-25',
    { start: '2026-12-31', end: '2027-01-02' },
  ]"
/>
```

ISO date-only strings are interpreted as calendar dates in the configured
timezone. Invalid bounds are ignored instead of disabling the entire calendar.
Non-standard date strings such as `1900.01.01` are deliberately rejected.

## Timezones

Use an IANA timezone name or `UTC`. When omitted, the browser's local timezone
is used.

```vue
<Calendar timezone="America/New_York" />
<DatePicker v-model="dateTime" mode="dateTime" timezone="UTC" />
```

Timezone calculations preserve local-midnight dates and account for daylight
saving transitions.

## Themes

Light mode is the default. Explicit component configuration takes precedence
over document and operating-system preferences.

```vue
<Calendar :is-dark="false" />
<Calendar :is-dark="true" />
<Calendar is-dark="system" />
<Calendar :is-dark="{ selector: ':root', darkClass: 'dark' }" />
```

Automatic mode observes system-theme changes. It also respects explicit
ancestor themes such as `data-bs-theme="light"`, `data-theme="dark"`, and
inline `color-scheme` declarations.

The built-in color names are `gray`, `red`, `orange`, `yellow`, `green`, `teal`,
`blue`, `indigo`, `purple`, and `pink`.

## Layout customization

Calendar geometry is exposed through CSS custom properties. Override variables
on a calendar instance or an application wrapper instead of coupling application
styles to internal selectors.

```css
.compact-calendar {
  --vc-container-bg: transparent;
  --vc-pane-min-width: 13rem;
  --vc-weeks-min-width: 13rem;
  --vc-day-min-height: 1.75rem;
  --vc-day-content-width: 1.75rem;
  --vc-day-content-height: 1.75rem;
  --vc-day-content-outside-month-opacity: 0.6;
  --vc-highlight-width: 1.75rem;
  --vc-highlight-height: 1.75rem;
  --vc-header-margin-top: 0;
  --vc-time-picker-padding: 0 0.5rem;
  --vc-time-select-group-bg: transparent;
}
```

The variables cover container backgrounds, pane and week dimensions, header
spacing, day and highlight geometry, time-picker layout, and select controls.
Defaults are listed in [`src/styles/theme.css`](src/styles/theme.css).

## Public exports

| Export | Purpose |
| --- | --- |
| default | Vue plugin that registers all public components |
| `Calendar` | Calendar component |
| `DatePicker` | Date and time picker component |
| `Popover`, `PopoverRow` | Public popover components |
| `setupCalendar` | Installs global defaults without registering components |
| `popoverDirective` | Popover trigger directive |
| `PopoverOptions` | TypeScript type for popover configuration |
| `createCalendar`, `useCalendar` | Calendar composables |
| `createDatePicker`, `useDatePicker` | Date picker composables |

Detailed API documentation is available under [`docs/calendar`](docs/calendar)
and [`docs/datepicker`](docs/datepicker).

## Migration from `v-calendar-fixed`

`v-calendar-3@1.0.1` starts a new package lineage. Replace package imports and
the CSS import; the Vue component API remains compatible.

```diff
- import VCalendar from 'v-calendar-fixed';
- import 'v-calendar-fixed/style.css';
+ import VCalendar from 'v-calendar-3';
+ import 'v-calendar-3/style.css';
```

## Development

```sh
git clone https://github.com/BEJIbXEOP/v-calendar.git
cd v-calendar
npm install
```

Install the browser binaries before the first browser-test run.

```sh
npx playwright install
```

Available validation commands:

```sh
npm run lint
npm run typecheck
npm run test:unit
npm run test:browser
npm run build
npm run check:package
npm run validate
```

The browser matrix includes Chromium, Firefox, desktop WebKit, and touch WebKit.

## License

[MIT](LICENSE)
