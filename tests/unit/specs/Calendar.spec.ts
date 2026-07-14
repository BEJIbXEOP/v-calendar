import Calendar from '@/components/Calendar/Calendar.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { testNavigationMethods, testNavigationProps } from './navigation';
import { testCalendarSlots } from './slots';

describe('Calendar', () => {
  describe(':props', () => {
    testNavigationProps(ctx => mount(Calendar, ctx));
  });

  describe(':methods', () => {
    testNavigationMethods(ctx => mount(Calendar, ctx));
  });

  describe(':slots', () => {
    testCalendarSlots(ctx => mount(Calendar, ctx));
  });

  describe(':period layout', () => {
    it('renders rows=2 as two horizontal panes with complete headers', () => {
      const wrapper = mount(Calendar, {
        props: {
          rows: 2,
          initialPage: { year: 2024, month: 1 },
          transition: 'none',
        },
      });

      expect(wrapper.find('.vc-pane-header-wrapper').exists()).toBe(false);
      expect(wrapper.find('.vc-pane-layout').attributes('style')).toContain(
        'grid-template-columns: repeat(2, 1fr)',
      );

      const panes = wrapper.findAll('.vc-pane');
      expect(panes).toHaveLength(2);
      expect(panes[0].classes()).toContain('column-1');
      expect(panes[1].classes()).toContain('column-2');
      expect(panes[0].findAll('.vc-arrow')).toHaveLength(2);
      expect(panes[1].findAll('.vc-arrow')).toHaveLength(2);
      expect(panes.map(pane => pane.find('.vc-title').text())).toEqual([
        'January 2024',
        'February 2024',
      ]);
    });

    it('moves a two-pane period one month from either pane header', async () => {
      const wrapper = mount(Calendar, {
        props: {
          rows: 2,
          initialPage: { year: 2024, month: 1 },
          transition: 'none',
        },
      });

      await wrapper
        .findAll('.vc-pane')[1]
        .find('.vc-arrow.vc-next')
        .trigger('click');

      expect(
        wrapper.findAll('.vc-pane').map(pane => pane.find('.vc-title').text()),
      ).toEqual(['February 2024', 'March 2024']);
    });

    it('preserves the shared header for non-period layouts', () => {
      const wrapper = mount(Calendar, {
        props: { initialPage: { year: 2024, month: 1 } },
      });

      expect(wrapper.find('.vc-pane-header-wrapper').exists()).toBe(true);
      expect(wrapper.findAll('.vc-pane .vc-arrow')).toHaveLength(0);
    });

    it('refreshes page coordinates when an equal-sized layout changes', async () => {
      const wrapper = mount(Calendar, {
        props: {
          rows: 2,
          columns: 1,
          initialPage: { year: 2024, month: 1 },
        },
      });

      await wrapper.setProps({ rows: 1, columns: 2 });

      expect(wrapper.find('.vc-pane-header-wrapper').exists()).toBe(true);
      expect(wrapper.findAll('.vc-pane')[1].classes()).toContain('column-2');
      expect(wrapper.findAll('.vc-pane .vc-arrow')).toHaveLength(0);
    });

    it('balances trimmed week rows across both period panes', async () => {
      const wrapper = mount(Calendar, {
        props: {
          rows: 2,
          trimWeeks: true,
          initialPage: { year: 2020, month: 8 },
          transition: 'none',
        },
      });

      const weekCounts = () =>
        wrapper.findAll('.vc-pane').map(pane => pane.findAll('.vc-week').length);

      expect(weekCounts()).toEqual([6, 6]);

      await wrapper.vm.move(
        { year: 2024, month: 4 },
        { transition: 'none' },
      );

      expect(weekCounts()).toEqual([5, 5]);
    });
  });

  describe(':adjacent month dates', () => {
    it('renders leading and trailing dates using the configured week start', () => {
      const wrapper = mount(Calendar, {
        props: {
          initialPage: { year: 2024, month: 10 },
          firstDayOfWeek: 2,
          trimWeeks: true,
        },
      });

      const previousMonthDay = wrapper.get('.vc-day.id-2024-09-30');
      const nextMonthDay = wrapper.get('.vc-day.id-2024-11-01');

      expect(previousMonthDay.classes()).toContain('in-prev-month');
      expect(previousMonthDay.get('.vc-day-content').text()).toBe('30');
      expect(nextMonthDay.classes()).toContain('in-next-month');
      expect(nextMonthDay.get('.vc-day-content').text()).toBe('1');
    });
  });
});
