<template>
  <a-tabs centered type="card">
    <a-tab-pane key="event-template-viewer" tab="Viewer">
      <EventTemplateViewer />
    </a-tab-pane>
    <a-tab-pane key="event-template-manager" tab="Manager">
      <EventTemplateManager />
    </a-tab-pane>
  </a-tabs>
</template>


<script setup>
import EventTemplateViewer from '@/components/EventTemplateViewer.vue';
import EventTemplateManager from '@/components/EventTemplateManager.vue';
</script>