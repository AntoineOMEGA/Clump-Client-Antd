<template>
  <a-tabs centered type="card" block>
    <a-tab-pane key="schedule-viewer" tab="Viewer">
      <ScheduleViewer />
    </a-tab-pane>
    <a-tab-pane key="schedule-manager" tab="Manager">
      <ScheduleManager />
    </a-tab-pane>
  </a-tabs>
</template>


<script setup>
import ScheduleViewer from '@/components/ScheduleViewer.vue';
import ScheduleManager from '@/components/ScheduleManager.vue';
</script>