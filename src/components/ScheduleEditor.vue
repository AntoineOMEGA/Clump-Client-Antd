<template>
  <a-drawer :open="visible" @close="close()">
    <a-spin :spinning="scheduleLoading">
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
import dayjs from 'dayjs';
</script>

<script>
export default {
  props: ['visible'],
  emits: ['close'],
  mounted() {
    this.getTags();
    this.getSchedules();
  },
  data() {
    return {
      spinning: false,
      selectedWeek: dayjs(),
      scheduleEditOverlayVisible: false,
      scheduleLoading: false,
      scheduleFormData: {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs()
      },
      scheduleFormErrorMessage: ''
    };
  },
  methods: {
    configureScheduleViewer(schedule) {
      this.scheduleViewerOverlayVisible = true;
      this.eventFormData.scheduleID = schedule._id;

      this.getEventsOnSchedule(schedule._id);
    },
    resetScheduleForm() {
      this.scheduleLoading = false;
      this.scheduleEditOverlayVisible = false;
      this.scheduleFormData = {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs()
      };
      this.scheduleFormErrorMessage = '';
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
          tagIDs: this.scheduleFormData.tagIDs,
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleLoading = false;
          }
        });
      });
    },
    configureScheduleForm(schedule) {
      this.scheduleFormData.title = schedule.title;
      this.scheduleFormData.tagIDs = schedule.tagIDs;
      this.scheduleFormData._id = schedule._id;
      this.scheduleFormData.startDate = dayjs(schedule.startDate);
      this.scheduleFormData.endDate = dayjs(schedule.endDate);

      this.scheduleEditOverlayVisible = true;
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
          tagIDs: this.scheduleFormData.tagIDs
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex((schedule) => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

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
          let indexOfDeletedSchedule = this.schedules.findIndex((schedule) => schedule._id === this.scheduleFormData._id);
          this.schedules.splice(indexOfDeletedSchedule, 1);

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
      this.resetScheduleForm();
      this.$emit('close');
    }
  }
};
</script>
