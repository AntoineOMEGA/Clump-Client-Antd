<template>
  <a-float-button type="primary" @click="scheduleEditOverlayVisible = !scheduleEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px;margin-bottom: 15px;">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <template v-for="schedule in schedules.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="schedule._id">
    <a-card v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())"
      style="margin: 10px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
      <template #extra>
        <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px; margin-top: 20px" key="calendar"
          @click="console.log('Open Calendar')" />
        <EditOutlined style="font-size: 1.5rem; margin-top: 20px" key="edit" @click="configureScheduleForm(schedule)" />
      </template>
      <a-descriptions v-if="scheduleFilterSettings.details" bordered>
        <a-descriptions-item label="Duration">
          {{ dayjs(schedule.startDate).format('MM-DD-YYYY') + ' to ' + dayjs(schedule.endDate).format('MM-DD-YYYY') }}
        </a-descriptions-item>
        <a-descriptions-item label="Comments">{{ schedule.comments }}</a-descriptions-item>
      </a-descriptions>
      <div>
        <a-tag color="#f50">#f50</a-tag>
      </div>
    </a-card>
  </template>

  <a-drawer v-model:open="scheduleEditOverlayVisible" @close="resetScheduleForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="scheduleFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Tag
        <a-select size="large" v-model:value="scheduleFormData.primaryTagID" style="width: 100%" mode="multiple">
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

      <div class="mb-2">
        Comments
        <a-textarea size="large" v-model:value="scheduleFormData.comments"></a-textarea>
      </div>

      <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2"
        v-if="scheduleFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button v-if="!scheduleFormData._id" type="primary" size="large" block
          @click="createSchedule()">Create</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block
          @click="updateSchedule()">Save</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger
          @click="deleteSchedule()">Archive</a-button>
      </a-flex>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() {
    this.getSchedules();
    this.getTags();
  },
  data() {
    return {
      scheduleEditOverlayVisible: false,
      scheduleFormData: {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs(),
        comments: ''
      },
      scheduleFormErrorMessage: '',
      schedules: [],
      tags: [],
      scheduleFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    resetScheduleForm() {
      this.scheduleEditOverlayVisible = false;
      this.scheduleFormData = {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs(),
        comments: ''
      };
      this.scheduleFormErrorMessage = '';
    },
    getSchedules() {
      fetch('/api/v1/schedules', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.schedules = data.data.schedules;
          }
        });
      });
    },
    createSchedule() {
      fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: [],
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    configureScheduleForm(schedule) {
      this.scheduleFormData.title = schedule.title;
      this.scheduleFormData.tagIDs = schedule.tagIDs;
      this.scheduleFormData._id = schedule._id;
      this.scheduleFormData.comments = schedule.comments;
      this.scheduleFormData.startDate = dayjs(schedule.startDate);
      this.scheduleFormData.endDate = dayjs(schedule.endDate);

      this.scheduleEditOverlayVisible = true;
    },
    updateSchedule() {
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: this.scheduleFormData.tagIDs,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex((schedule) => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteSchedule() {
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            let indexOfDeletedSchedule = this.schedules.findIndex((schedule) => schedule._id === this.scheduleFormData._id);
            this.schedules.splice(indexOfDeletedSchedule, 1);

            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    getTags() {
      fetch('/api/v1/tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.tags = data.data.tags;
          }
        });
      });
    }
  }
};
</script>
