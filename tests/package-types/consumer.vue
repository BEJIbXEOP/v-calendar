<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from 'v-calendar-3';

const date = ref<Date | null>(null);
const popover = {
  visibility: 'hover-focus',
  teleport: true,
} as const;
</script>

<template>
  <DatePicker
    v-model="date"
    :rows="2"
    :columns="1"
    trim-weeks
    :initial-page="{ year: 2026, month: 7 }"
    mode="dateTime"
    is24hr
    :popover="popover"
  />
  <VDatePicker
    v-model="date"
    :rows="2"
    :columns="1"
    trim-weeks
    :initial-page="{ year: 2026, month: 7 }"
    mode="dateTime"
    is24hr
    :popover="popover"
  />
</template>
