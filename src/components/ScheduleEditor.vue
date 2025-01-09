<template>
  <a-drawer :open="visible" @close="resetScheduleForm()">
    <a-spin :spinning="scheduleLoading">
      <a-form>
        <div class="mb-2">
          Title
          <a-input size="large" v-model:value="scheduleFormData.title"></a-input>
        </div>

        <div class="mb-2">
          Color
          <a-input size="large" type="color" v-model:value="scheduleFormData.color"></a-input>
        </div>

        <div class="mb-2">
          Time Zone
          <a-select v-model:value="scheduleFormData.timeZone" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="timeZone in timeZones" :value="timeZone" :key="timeZone">
              {{ timeZone }}
            </a-select-option>
          </a-select>
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
              <a-date-picker size="large" v-model:value="scheduleFormData.startDate"
                format="MM-DD-YYYY"></a-date-picker>
            </div>
            <div>
              End Date
              <a-date-picker size="large" v-model:value="scheduleFormData.endDate" format="MM-DD-YYYY"></a-date-picker>
            </div>
          </a-flex>
        </div>

        <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2"
          v-if="scheduleFormErrorMessage != ''" />

        <a-flex justify="space-around" align="middle" gap="middle">
          <a-button v-if="!scheduleFormData._id" type="primary" size="large" block
            @click="createSchedule()">Create</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block
            @click="updateSchedule()">Save</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger
            @click="deleteSchedule()">Delete</a-button>
        </a-flex>
      </a-form>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import dayjs from 'dayjs';
</script>

<script>
import { Button, Drawer, Spin, Form, Input, Flex, Alert, DatePicker, Select, SelectOption } from 'ant-design-vue';

export default {
  components: {
    AButton: Button,
    ADrawer: Drawer,
    ASpin: Spin,
    AForm: Form,
    AInput: Input,
    AFlex: Flex,
    AAlert: Alert,
    ADatePicker: DatePicker,
    ASelect: Select,
    ASelectOption: SelectOption
  },
  props: ['visible', 'schedule'],
  emits: ['close'],
  updated() {
    if (this.visible) {
      this.configureScheduleForm(this.schedule);
      this.getTags();
    }
  },
  data() {
    return {
      spinning: false,
      selectedWeek: dayjs(),
      scheduleLoading: false,
      timeZones: new Intl.Locale('en-US').timeZones,
      scheduleFormData: {
        title: '',
        color: '#ffffff',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs().add(10, 'year')
      },
      scheduleFormErrorMessage: '',
      tags: []
    };
  },
  methods: {
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
    },
    resetScheduleForm() {
      this.scheduleLoading = false;
      this.scheduleFormData = {
        title: '',
        color: '#ffffff',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs().add(10, 'year')
      };
      this.scheduleFormErrorMessage = '';
      this.close();
    },
    createSchedule() {
      this.scheduleLoading = true;
      fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          color: this.scheduleFormData.color,
          timeZone: this.scheduleFormData.timeZone,
          tagIDs: this.scheduleFormData.tagIDs,
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleLoading = false;
          }
        });
      });
    },
    configureScheduleForm() {
      this.scheduleFormData.title = this.schedule.title;
      this.scheduleFormData.color = this.schedule.color;
      this.scheduleFormData.timeZone = this.schedule.timeZone;
      this.scheduleFormData.tagIDs = this.schedule.tagIDs;
      this.scheduleFormData._id = this.schedule._id;
      this.scheduleFormData.startDate = dayjs(this.schedule.startDate);
      this.scheduleFormData.endDate = dayjs(this.schedule.endDate);
    },
    updateSchedule() {
      this.scheduleLoading = true;
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          color: this.scheduleFormData.color,
          timeZone: this.scheduleFormData.timeZone,
          tagIDs: this.scheduleFormData.tagIDs
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleLoading = false;
          }
        });
      });
    },
    deleteSchedule() {
      this.scheduleLoading = true;
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.resetScheduleForm();
        } else {
          response.json().then((data) => {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleLoading = false;
          });
        }
      });
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>
