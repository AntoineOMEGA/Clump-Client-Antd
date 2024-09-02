<template>
  <a-drawer v-model:open="visible" @close="resetScheduleForm()">
    <a-spin :spinning="scheduleSpinning">
      <a-form>
        <div class="mb-2">
          Title
          <a-input size="large" v-model:value="scheduleFormData.title"></a-input>
        </div>

        <div class="mb-2">
          Tag
          <a-select size="large" v-model:value="scheduleFormData.tagIDs" style="width: 100%" mode="multiple">
            <a-select-option v-for="tag in tags" :value="tag._id" :key="tag._id">
              {{ tag.title }}
            </a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Date
              <a-date-picker size="large" v-model:value="scheduleFormData.startDate" format="MM-DD-YYYY"></a-date-picker>
            </div>
            <div>
              End Date
              <a-date-picker size="large" v-model:value="scheduleFormData.endDate" format="MM-DD-YYYY"></a-date-picker>
            </div>
          </a-flex>
        </div>

        <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2" v-if="scheduleFormErrorMessage != ''" />

        <a-flex justify="space-around" align="middle" gap="middle">
          <a-button v-if="!scheduleFormData._id" type="primary" size="large" block @click="createSchedule()">Create</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block @click="updateSchedule()">Save</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger @click="deleteSchedule()">Delete</a-button>
        </a-flex>
      </a-form>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined, CaretRightOutlined, CaretLeftOutlined, ShareAltOutlined, UserDeleteOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  props: ['visible'],
  mounted() {
    this.getTags();
    this.getSchedules();
  },
  data() {
    return {
      spinning: false,
      selectedWeek: dayjs(),
      scheduleEditOverlayVisible: false,
      scheduleLoadSpinning: false,
      scheduleSpinning: false,
      scheduleFormData: {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs()
      },
      scheduleFormErrorMessage: '',
      schedules: [],
      eventTemplates: [],
      events: [],
      tags: [],
      scheduleFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {}
};
</script>
