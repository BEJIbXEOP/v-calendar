<template>
  <template v-if="$slots.default">
    <slot v-bind="slotCtx" />
    <DatePickerPopover v-bind="{ ...forwardedCalendarProps, ...$attrs }" />
  </template>
  <DatePickerBase
    v-else
    v-bind="{ ...forwardedCalendarProps, ...$attrs }"
  />
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue';
import { calendarPropsDef } from '../../use/calendar';
import { createDatePicker, emits, propsDef } from '../../use/datePicker';
import { omit } from '../../utils/helpers';
import DatePickerBase from './DatePickerBase.vue';
import DatePickerPopover from './DatePickerPopover.vue';

const forwardedCalendarPropNames = Object.keys(calendarPropsDef).filter(
  name => name !== 'attributes',
);

export default defineComponent({
  inheritAttrs: false,
  emits,
  props: propsDef,
  components: { DatePickerBase, DatePickerPopover },
  setup(props, ctx) {
    const datePicker = createDatePicker(props, ctx);
    const slotCtx = reactive(omit(datePicker, 'calendarRef', 'popoverRef'));
    const forwardedCalendarProps = computed(() =>
      Object.fromEntries(
        forwardedCalendarPropNames.map(name => [
          name,
          props[name as keyof typeof props],
        ]),
      ),
    );
    return { ...datePicker, forwardedCalendarProps, slotCtx };
  },
});
</script>
