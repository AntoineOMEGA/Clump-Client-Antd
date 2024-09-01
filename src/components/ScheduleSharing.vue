<template>
  <a-drawer v-model:open="scheduleSharingOverlayVisible" @close="resetEventForm()">
    <a-spin :spinning="scheduleSharingLoadSpinning">
      <template v-for="scheduleLink in scheduleLinks.sort((a, b) => (a.recipient >= b.recipient ? 1 : -1))"
        :key="scheduleLink._id">
        <a-card style="margin: 10px" :title="scheduleLink.recipient" :bodyStyle="{ padding: '0' }">
          <template #extra>
            <UserDeleteOutlined style="font-size: 1.5rem" key="delete" @click="deleteScheduleLink(scheduleLink._id)" />
          </template>
        </a-card>

        <a-button type="primary" style="margin: 10px" @click="recurrenceRuleModalVisible = true">Repeat Event</a-button>
      </template>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { UserDeleteOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>