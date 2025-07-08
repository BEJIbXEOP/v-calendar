<template>
  <Component v-if="slot" :is="slot" v-bind="$attrs" />
  <slot v-else />
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { useSlot } from '../../use/slots';
import { VNode } from 'vue';

export type CalendarSlotName =
  | 'day-content'
  | 'day-popover'
  | 'dp-footer'
  | 'footer'
  | 'header-title-wrapper'
  | 'header-title'
  | 'header-prev-button'
  | 'header-next-button'
  | 'nav'
  | 'nav-prev-button'
  | 'nav-next-button'
  | 'page'
  | 'time-header';

const props = defineProps<{
  name: CalendarSlotName;
}>();

const slot = useSlot(props.name) as unknown as VNode|VNode[];
</script>
