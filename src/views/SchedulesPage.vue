<template>
  <a-tabs centered type="card" block>
    <a-tab-pane key="schedules" tab="Schedules">
      <Schedules />
    </a-tab-pane>
    <a-tab-pane key="schedule-tags" tab="Tags">
      <ScheduleTags />
    </a-tab-pane>
    <a-tab-pane key="schedule-analytics" tab="Analytics">
      <ScheduleAnalytics />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup>
import Schedules from '@/components/Schedules.vue';
import ScheduleTags from '@/components/ScheduleTags.vue';
import ScheduleAnalytics from '@/components/ScheduleAnalytics.vue';
</script>
