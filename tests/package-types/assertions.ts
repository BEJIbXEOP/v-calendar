import type { GlobalComponents } from 'vue';
import {
  DatePicker,
  type CalendarProps,
  type DatePickerProps,
} from 'v-calendar-3';

type LocalDatePickerProps = InstanceType<typeof DatePicker>['$props'];
type GlobalDatePickerProps = InstanceType<
  GlobalComponents['VDatePicker']
>['$props'];

function acceptLocalProps(_props: LocalDatePickerProps) {}
function acceptGlobalProps(_props: GlobalDatePickerProps) {}
function acceptExportedProps(_props: CalendarProps & DatePickerProps) {}

const validProps = {
  rows: 2,
  columns: 1,
  trimWeeks: true,
  initialPage: { year: 2026, month: 7 },
  mode: 'dateTime',
  is24hr: true,
  popover: {
    visibility: 'hover-focus',
    teleport: true,
  },
} as const;

acceptLocalProps(validProps);
acceptGlobalProps(validProps);
acceptExportedProps(validProps);

// @ts-expect-error Calendar row counts are numeric, even when HTML is not.
acceptLocalProps({ rows: '2' });
// @ts-expect-error The global registration must retain the same prop contract.
acceptGlobalProps({ columns: '2' });
// @ts-expect-error DatePicker modes are a documented finite set.
acceptLocalProps({ mode: 'whatever' });
