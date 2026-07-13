import Calendar from '@/components/Calendar/Calendar.vue';
import { DateRange } from '@/utils/date/range';
import Locale from '@/utils/locale';
import { createWatcherController } from '@/utils/watchers';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

function dayContent(wrapper: ReturnType<typeof mount>, id: string) {
  return wrapper.get(`.vc-day.id-${id} .vc-day-content`);
}

describe('date boundary regressions', () => {
  it('supports native Date min and max bounds', () => {
    const wrapper = mount(Calendar, {
      props: {
        initialPage: { year: 2024, month: 3 },
        minDate: new Date(2024, 2, 10),
        maxDate: new Date(2024, 2, 20),
      },
    });

    expect(dayContent(wrapper, '2024-03-09').classes()).toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-10').classes()).not.toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-20').classes()).not.toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-21').classes()).toContain(
      'vc-disabled',
    );
  });

  it('treats ISO date-only bounds as calendar dates in a non-UTC timezone', () => {
    const wrapper = mount(Calendar, {
      props: {
        initialPage: { year: 2024, month: 3 },
        timezone: 'America/Los_Angeles',
        minDate: '2024-03-10',
        maxDate: '2024-03-20',
      },
    });

    expect(dayContent(wrapper, '2024-03-09').classes()).toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-10').classes()).not.toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-20').classes()).not.toContain(
      'vc-disabled',
    );
    expect(dayContent(wrapper, '2024-03-21').classes()).toContain(
      'vc-disabled',
    );
  });

  it('ignores invalid bounds instead of creating an unbounded disabled range', () => {
    const wrapper = mount(Calendar, {
      props: {
        initialPage: { year: 2024, month: 3 },
        minDate: 'not-a-date',
        maxDate: '1900.01.01',
      },
    });

    expect(wrapper.findAll('.vc-day-content.vc-disabled')).toHaveLength(0);
  });

  it('rejects invalid and implementation-dependent range strings', () => {
    const locale = new Locale('en-US');
    const invalid = DateRange.from('1900.01.01', locale);

    expect(invalid.start).toBeNull();
    expect(invalid.end).toBeNull();
    expect(locale.toDateOrNull('2024-02-30')).toBeNull();
  });

  it('keeps local midnight stable across DST boundaries', () => {
    const locale = new Locale('en-US', 'America/New_York');
    const springStart = locale.toDate('2024-03-10');
    const springEnd = locale.toDate('2024-03-11');
    const fallStart = locale.toDate('2024-11-03');
    const fallEnd = locale.toDate('2024-11-04');

    expect(locale.getDateParts(springStart)).toMatchObject({
      year: 2024,
      month: 3,
      day: 10,
      hours: 0,
    });
    expect(springEnd.getTime() - springStart.getTime()).toBe(23 * 60 * 60_000);
    expect(fallEnd.getTime() - fallStart.getTime()).toBe(25 * 60 * 60_000);
  });

  it('formats UTC without mutating the locale timezone', () => {
    const locale = new Locale('en-US', 'America/Los_Angeles');
    const date = new Date('2024-03-10T08:00:00.000Z');

    expect(locale.formatDate(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ')).toBe(
      '2024-03-10T08:00:00.000Z',
    );
    expect(locale.timezone).toBe('America/Los_Angeles');
    expect(locale.getDateParts(date)).toMatchObject({
      year: 2024,
      month: 3,
      day: 10,
      hours: 0,
    });
  });

  it('retains holiday styling when that date is disabled', () => {
    const wrapper = mount(Calendar, {
      props: {
        initialPage: { year: 2024, month: 12 },
        disabledDates: ['2024-12-25'],
        attributes: [
          {
            key: 'holiday',
            dates: ['2024-12-25'],
            highlight: { color: 'red', fillMode: 'light' },
          },
        ],
      },
    });
    const day = wrapper.get('.vc-day.id-2024-12-25');

    expect(day.get('.vc-day-content').classes()).toContain('vc-disabled');
    expect(day.find('.vc-highlight').exists()).toBe(true);
  });
});

describe('instance isolation', () => {
  it('does not share watcher suppression between calendar instances', () => {
    const first = createWatcherController();
    const second = createWatcherController();
    let secondRuns = 0;

    first.skipWatcher('view', 1_000);
    second.handleWatcher('view', () => secondRuns++);

    expect(secondRuns).toBe(1);
  });
});
