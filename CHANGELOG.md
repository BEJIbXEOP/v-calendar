## 1.1.0 (`v-calendar-3`)

### Breaking Changes

* The package is published as `v-calendar-3`. Replace imports from
  `v-calendar-fixed` with `v-calendar-3`; the `1.0.1` version reset started a new
  package lineage and was not a downgrade from `v-calendar-fixed@3.1.9`.
* Package development now requires Node.js `^20.19.0 || >=22.12.0`. The
  component names, prop/event/slot names, exports, and TypeScript types remain
  unchanged.
* The `rows="2"`, `columns="1"` layout is now a horizontal two-month period
  calendar with navigation controls on both panes. Code that relied on this
  exact configuration being vertical must update its layout.

### Bug Fixes

* Parse ISO date-only values as local calendar dates without UTC day shifts.
* Ignore invalid minimum and maximum bounds instead of disabling every day.
* Preserve timezone configuration while formatting UTC values and use explicit
  timezone conversion APIs across DST transitions.
* Respect explicit component and document themes before system preferences,
  including iframe-owned documents.
* React to automatic system-theme changes and clean up media-query listeners.
* Close popovers after focus loss, outside pointer interaction, Escape,
  trigger removal, route replacement, and component unmount.
* Use Pointer Events for swipe and touch interaction and clean up all handlers.
* Isolate watcher suppression and calendar-grid messages per component instance.

### Tooling

* Upgrade the Vue 3, TypeScript, Vite, Vitest, ESLint, and Playwright toolchain.
* Add unit and browser regression suites, including desktop and touch WebKit.
* Generate ESM, CommonJS, CSS, and bundled TypeScript declaration artifacts.

### Styling

* Expose stable CSS custom properties for calendar dimensions, header spacing,
  day and highlight geometry, time-picker layout, and select controls.
* Display leading and trailing dates from adjacent months with configurable
  dimming instead of rendering those generated grid cells as invisible gaps.
* Keep both panes in a trimmed two-month period calendar at the same week count.
* Keep arrows and long month titles contained within compact period panes.


## 3.0.0-alpha.7

### Bug Fixes

* Fix defaults when using plugin
* Fix `iso` mask
* Fix broken navigation state when using `max-date`
* Fix double arrows appearing in time picker when using Tailwind reset styles

### Improvements

* Add `valid-hours` prop for time picker

## 3.0.0-alpha.8

### Bug Fixes

* Fix `valid-hours` and `minute-increment` props for input slot usage
* Fix bug where date picker would reset `null` dates

### Improvements

* Allow separate `valid-hours` and `minute-increment` for range dates

## 3.0.0

### Calendar

* Add `view` prop to display weekly calendars
* Add `initial-page` and `initial-page-position` props
* Deprecate `from-page`, `from-date`, `to-page`, `to-date` props in lieu of `initial-page`
* Add `moveBy` method to move by number of pages
* Emit native `event` as 2nd argument for day and week events (`dayclick`, `daymouseenter`, `daymouseleave`, `dayfocusin`, `dayfocusout`, `daykeydown`, `weeknumberclick`)
* Rename `SetupCalendar` export to `setupCalendar`

### Date Picker

* Add `rules` prop for limiting `hours`, `minutes`, `seconds` and `milliseconds`
* Deprecate `valid-hours` and `minute-increment` props in lieu of `rules`
* Deprecate `modelConfig` prop in lieu of `number` and `string` model modifiers
* Soft deprecate `is-range` prop in lieu of `range` model modifier
* Add `time-accuracy` prop to allow selecting seconds and milliseconds components in time picker
* Major redesign of `TimePicker` to fit more time component selections
* Deprecate `update-layout` slot prop as it is no longer needed

## 3.0.1

### Calendar

* Add missing `type=button` attribute to navigation buttons

## 3.0.2

### Bug Fixes

* Include `attributes` within day event objects
* Fix date normalization bug when clearing input fields
* Fix `day-content` slot

## 3.0.3

## Bug Fixes

* Fix `header-title`, `header-prev-button`, `header-next-button`, `nav-prev-button` and `nav-next-button` slots

## Improvements

* Improve header elements/styling

## 3.1.0

### Project

* Add prettier plugin to sort imports
* Clean up unused helper methods, refactor out createGuid
* Use symbols in lieu of GUIDs
* Fixes type declaration
* Bump `.nvm` version to 18.14.2

### Calendar

* Group calendar components in Calendar directory
* Group calendar grid components in CalendarGrid directory
* CalendarPane => CalendarPage
* Adds `header-title-wrapper` slot
* Fixes `disabledDates` prop usage

### DatePicker

* Refactors from render function to templates to play nice with vue-test-utils
* Refactors mounting method in tests
* Fixes bug not passing minDate and maxDate to Calendar
* Fixes `footer` slot for `dateTime` mode
* Adds slot tests
* Removes `await` for datepicker mount in tests

## 3.1.1

## Calendar

* Fixes bug when auto-assigning attribute keys

### DatePicker

* Add tests for time picker
* Add class for time select components
* Fix bug where value not cleared when toggling `range` mode

## 3.1.2

## Bug Fixes

* Fixes date normalization when using different locales

## Improvements

* Updates `date-fns-tz` to 2.0
