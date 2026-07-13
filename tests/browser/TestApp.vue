<template>
  <main>
    <button id="outside" type="button">Outside</button>

    <DatePicker
      id="interaction-calendar"
      v-model="selectedDate"
      :initial-page="initialPage"
    />
    <output id="selected-date">{{ selectedDateLabel }}</output>

    <DatePicker
      id="variable-calendar"
      v-model="styledDate"
      mode="dateTime"
      :initial-page="initialPage"
      style="
        --vc-day-content-width: 31px;
        --vc-day-content-height: 31px;
        --vc-header-margin-top: 0px;
        --vc-pane-min-width: 220px;
        --vc-time-picker-flex-direction: row;
        --vc-time-select-group-icon-display: none;
        --vc-time-select-bg: rgb(1, 2, 3);
        --vc-select-width: 22px;
      "
    />

    <Calendar id="explicit-light" :is-dark="false" />
    <Calendar id="explicit-dark" :is-dark="true" />
    <Calendar v-if="showAutomatic" id="automatic" is-dark="system" />
    <button id="toggle-automatic" @click="showAutomatic = !showAutomatic">
      Toggle automatic
    </button>

    <section id="multiple-calendars">
      <Calendar id="instance-light" :is-dark="false" />
      <Calendar id="instance-dark" :is-dark="true" />
    </section>

    <button
      v-if="showClickTrigger"
      id="click-trigger"
      v-popover="clickPopover"
      type="button"
    >
      Click popover
    </button>
    <Popover id="click-popover">
      <span id="click-popover-content">Click content</span>
    </Popover>
    <button id="remove-click-trigger" @click="showClickTrigger = false">
      Remove trigger
    </button>

    <button id="focus-trigger" v-popover="focusPopover" type="button">
      Focus popover
    </button>
    <Popover id="focus-popover">
      <span id="focus-popover-content">Focus content</span>
    </Popover>

    <button id="toggle-lifecycle" @click="showLifecycle = !showLifecycle">
      Toggle lifecycle
    </button>
    <Calendar v-if="showLifecycle" id="lifecycle-calendar" />

    <iframe ref="iframeRef" id="theme-frame" title="Theme frame" />
    <button id="unmount-frame" @click="unmountFrame">Unmount frame</button>
  </main>
</template>

<script setup lang="ts">
import {
  type App,
  createApp,
  defineComponent,
  h,
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import Calendar from '../../src/components/Calendar/Calendar.vue';
import DatePicker from '../../src/components/DatePicker/DatePicker.vue';
import Popover from '../../src/components/Popover/Popover.vue';
import { popoverDirective as vPopover } from '../../src/utils/popovers';

const initialPage = { year: 2024, month: 1 };
const selectedDate = ref<Date | null>(null);
const styledDate = ref<Date | null>(new Date(2024, 0, 15, 12));
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});
const showAutomatic = ref(true);
const showClickTrigger = ref(true);
const showLifecycle = ref(false);
const iframeRef = ref<HTMLIFrameElement>();
let iframeApp: App<Element> | null = null;

const clickPopover = {
  id: 'click-popover',
  visibility: 'click' as const,
  hideDelay: 0,
};
const focusPopover = {
  id: 'focus-popover',
  visibility: 'focus' as const,
  hideDelay: 0,
};

function unmountFrame() {
  iframeApp?.unmount();
  iframeApp = null;
}

onMounted(() => {
  const ownerDocument = iframeRef.value?.contentDocument;
  if (!ownerDocument) return;
  ownerDocument.documentElement.dataset.bsTheme = 'light';
  ownerDocument.documentElement.style.colorScheme = 'light';
  const host = ownerDocument.createElement('div');
  host.id = 'iframe-host';
  ownerDocument.body.append(host);
  iframeApp = createApp(
    defineComponent({
      render: () =>
        h(Calendar, {
          id: 'iframe-calendar',
          isDark: 'system',
          initialPage,
        }),
    }),
  );
  iframeApp.mount(host);
});

onUnmounted(unmountFrame);
</script>
