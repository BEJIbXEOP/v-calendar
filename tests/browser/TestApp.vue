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
        --vc-day-content-outside-month-opacity: 0.35;
        --vc-header-margin-top: 0px;
        --vc-pane-min-width: 220px;
        --vc-time-picker-flex-direction: row;
        --vc-time-select-group-icon-display: none;
        --vc-time-select-bg: rgb(1, 2, 3);
        --vc-select-width: 22px;
      "
    />

    <Calendar
      id="period-calendar"
      :rows="2"
      :initial-page="initialPage"
      transition="none"
    />
    <Calendar
      id="balanced-period-calendar"
      :rows="2"
      trim-weeks
      :initial-page="{ year: 2020, month: 8 }"
      transition="none"
      style="
        --vc-pane-min-width: 190px;
        --vc-pane-max-width: 190px;
        --vc-weeks-min-width: 190px;
        --vc-weeks-max-width: 190px;
        --vc-header-title-font-size: 18px;
        --vc-header-padding: 0 10px;
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

    <section
      id="teleport-clipping-parent"
      style="position: relative; width: 240px; height: 40px; overflow: hidden"
    >
      <DatePicker
        v-if="showTeleportedPicker"
        v-model="teleportedDate"
        :initial-page="initialPage"
        :popover="teleportedPopover"
      >
        <template #default="{ inputValue, inputEvents }">
          <button id="teleport-trigger" type="button" v-on="inputEvents">
            {{ inputValue || 'Open teleported date picker' }}
          </button>
        </template>
      </DatePicker>
    </section>
    <button id="toggle-teleported-picker" @click="showTeleportedPicker = false">
      Unmount teleported date picker
    </button>

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
const showTeleportedPicker = ref(true);
const teleportedDate = ref<Date | null>(null);
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
const teleportedPopover = {
  visibility: 'hover-focus' as const,
  hideDelay: 0,
  teleport: true,
};

function asVNodeListeners(handlers: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(handlers).map(([event, handler]) => [
      `on${event.charAt(0).toUpperCase()}${event.slice(1)}`,
      handler,
    ]),
  );
}

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
        h('div', [
          h(Calendar, {
            id: 'iframe-calendar',
            isDark: 'system',
            initialPage,
          }),
          h(
            DatePicker,
            {
              initialPage,
              popover: {
                visibility: 'hover-focus',
                hideDelay: 0,
                teleport: true,
              },
            },
            {
              default: ({
                inputEvents,
              }: {
                inputEvents: Record<string, unknown>;
              }) =>
                h(
                  'button',
                  {
                    id: 'iframe-date-trigger',
                    type: 'button',
                    ...asVNodeListeners(inputEvents),
                  },
                  'Open iframe date picker',
                ),
            },
          ),
        ]),
    }),
  );
  iframeApp.mount(host);
});

onUnmounted(unmountFrame);
</script>
