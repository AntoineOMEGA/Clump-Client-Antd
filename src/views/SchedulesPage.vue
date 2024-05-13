<template>
  <a-tabs centered type="card" block>
    <a-tab-pane key="schedule-viewer" tab="Schedules">
      <ScheduleViewer />
    </a-tab-pane>
    <a-tab-pane key="schedule-manager" tab="Tags">
      <ScheduleManager />
    </a-tab-pane>
    <a-tab-pane key="schedule-manager" tab="Analytics">
      <ScheduleManager />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup>
import ScheduleViewer from '@/components/ScheduleViewer.vue';
import ScheduleManager from '@/components/ScheduleManager.vue';
</script>
