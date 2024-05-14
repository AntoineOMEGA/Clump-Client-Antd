<template>
  <a-tabs centered type="card">
    <a-tab-pane key="event-templates" tab="Event Templates">
      <EventTemplates />
    </a-tab-pane>
    <a-tab-pane key="event-template-tags" tab="Tags">
      <EventTemplateTags />
    </a-tab-pane>
    <a-tab-pane key="event-template-analytics" tab="Analytics">
      <EventTemplateAnalytics />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup>
import EventTemplates from '@/components/EventTemplates.vue';
import EventTemplateTags from '@/components/EventTemplateTags.vue';
import EventTemplateAnalytics from '@/components/EventTemplateAnalytics.vue';
</script>
