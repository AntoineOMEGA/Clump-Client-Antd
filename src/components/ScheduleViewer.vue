<template>
  <a-float-button type="primary" style="height: 60px; width: 60px"
    @click="eventEditOverlayVisible = !eventEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <div>
    <a-flex justify="space-around" align="middle" gap="middle"
      style="padding: 5px; margin: 10px; background-color: #333333; border-radius: 10px">
      <a-date-picker placeholder="Start Date" format="MM-DD-YY" size="large"></a-date-picker>
      <a-date-picker placeholder="End Date" format="MM-DD-YY" size="large"></a-date-picker>
      <a-button @click="getCombineScheduleData(startDate, endDate)" size="large" type="primary">Load</a-button>
    </a-flex>
  </div>

  <a-card style="margin: 10px; background-color: #333333">
    <a-statistic title="Total Hours" :value="480">
      <template #suffix>
        <ClockCircleOutlined />
      </template>
    </a-statistic>
  </a-card>

  <div>
    <a-badge-ribbon v-for="i in 3" :key="i" text="Category" color="orange" style="top: -5px; right: 5px">
      <a-card style="margin: 10px" title="Florian.Antoine" :bodyStyle="{ padding: '0' }">
        <template #extra>
          <EyeOutlined style="font-size: 1.5rem; margin-top: 20px" key="edit"
            @click="eventEditOverlayVisible = !eventEditOverlayVisible" />
        </template>
      </a-card>
    </a-badge-ribbon>
  </div>

  <a-drawer v-model:open="eventEditOverlayVisible">
    <a-card style="margin-bottom: 20px; background-color: #333333" :bodyStyle="{ padding: '5px' }">
      <a-flex justify="space-between">
        <a-statistic title="Total Hours" :value="35" style="padding: 20px">
          <template #suffix>
            <ClockCircleOutlined />
          </template>
        </a-statistic>

        <a @click="scheduleFilterSettings.details = !scheduleFilterSettings.details" style="padding: 20px">
          Show Breakdown
        </a>
      </a-flex>
      <div v-if="scheduleFilterSettings.details">
        <a-descriptions style="background-color: #222; border-radius: 8px" bordered>
          <a-descriptions-item label="ROC">6 hrs</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-card>

    <a-card title="Tuesday 17th, March 2024" style="background-color: #333; margin-bottom: 20px"
      :bodyStyle="{ padding: '5px' }">
      <a-button
        style="height: auto; text-align: left; margin-bottom: 10px; padding: 15px; padding-top: 10px; padding-bottom: 10px"
        block>
        <a-flex justify="space-between">
          <div>
            <a-typography-title :level="5">9:00am - 12:00pm</a-typography-title>
            <a-typography-text>ROC Indexing</a-typography-text>
          </div>
          <EyeOutlined style="font-size: 1.2rem" />
        </a-flex>
      </a-button>
    </a-card>

    <a-float-button type="primary" style="height: 60px; width: 60px"
      @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  data() {
    return {
      eventEditOverlayVisible: false,
      schedules: [],
      scheduleCategories: [],
      scheduleFilterSettings: {
        details: false,
        search: ''
      },
    };
  }
};
</script>
