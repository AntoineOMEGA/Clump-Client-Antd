<template>
  <a-float-button-group trigger="click" type="primary" :style="{ right: '24px' }">
    <a-float-button type="primary" @click="scheduleEditOverlayVisible = !scheduleEditOverlayVisible">
      <template #icon>
        <PlusOutlined />
      </template>
    </a-float-button>
    <a-float-button type="primary" @click="scheduleCategoryEditOverlayVisible = !scheduleCategoryEditOverlayVisible">
      <template #icon>
        <PlusOutlined />
      </template>
    </a-float-button>
  </a-float-button-group>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <a-flex style="padding: 8px; padding-right: 20px" justify="right" class="mb-2">
    <a @click="scheduleFilterSettings.details = !scheduleFilterSettings.details">Show Details</a>
  </a-flex>

  <template v-for="schedule in schedules.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="schedule._id">
    <a-badge-ribbon :text="scheduleCategories[scheduleCategories.findIndex((scheduleCategory) => scheduleCategory._id === schedule.scheduleCategoryID)].title" :color="scheduleCategories[scheduleCategories.findIndex((scheduleCategory) => scheduleCategory._id === schedule.scheduleCategoryID)].color" style="top: -5px; right: 5px" v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())">
      <a-card style="margin: 10px; margin-bottom: 15px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
        <template #extra>
          <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px; margin-top: 20px" key="calendar" @click="console.log('Open Calendar')" />
          <EditOutlined style="font-size: 1.5rem; margin-top: 20px" key="edit" @click="configureUpdateScheduleForm(schedule)" />
        </template>
        <a-descriptions v-if="scheduleFilterSettings.details" bordered>
          <a-descriptions-item label="Duration">{{ schedule.startDate + ' to ' + schedule.endDate }}</a-descriptions-item>
          <a-descriptions-item label="Comments">{{ schedule.comments }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-typography-title :level="5" style="margin: 10px; margin-top: 25px">Schedule Categories</a-typography-title>
  <template v-for="scheduleCategory in scheduleCategories" :key="scheduleCategory._id">
    <a-badge-ribbon :text="scheduleCategory.color" :color="scheduleCategory.color" style="top: -5px; right: 5px">
      <a-card :title="scheduleCategory.title" style="margin: 10px">
        <template #extra>
          <edit-outlined style="font-size: 1.5rem; margin-top: 20px" key="edit" @click="configureUpdateScheduleCategoryForm(scheduleCategory)" />
        </template>
      </a-card>
    </a-badge-ribbon>
  </template>

  <a-drawer v-model:open="scheduleEditOverlayVisible" @close="resetForm()">
    <a-form>
      <a-input class="mb-2" size="large" addonBefore="Title" v-model:value="scheduleFormData.title"></a-input>
      <a-select class="mb-2" size="large" addonBefore="Category" v-model:value="scheduleFormData.scheduleCategoryID">
        <a-select-option v-for="scheduleCategory in scheduleCategories" :value="scheduleCategory._id" :key="scheduleCategory._id">{{ scheduleCategory.title }}</a-select-option>
      </a-select>
      <div class="d-flex justify-space-between">
        <a-input class="mb-2" size="large" addonBefore="Start Date" v-model:value="scheduleFormData.startDate" type="date"></a-input>
        <a-input class="mb-2" size="large" addonBefore="End Date" v-model:value="scheduleFormData.endDate" type="date"></a-input>
      </div>
      <a-textarea class="mb-2" size="large" addonBefore="Comments" v-model:value="scheduleFormData.comments"></a-textarea>

      <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2" v-if="scheduleFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button v-if="!scheduleFormData._id" type="primary" size="large" block @click="createSchedule()">Create</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block @click="updateSchedule()">Save</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger @click="deleteSchedule()">Archive</a-button>
      </a-flex>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="scheduleCategoryEditOverlayVisible" @close="resetForm()">
    <a-form>
      <a-input class="mb-2" size="large" addonBefore="Title" v-model:value="scheduleCategoryFormData.title"></a-input>
      <a-input class="mb-2" size="large" addonBefore="Description" v-model:value="scheduleCategoryFormData.description"></a-input>
      <a-input class="mb-2" size="large" addonBefore="Color" type="color" v-model:value="scheduleCategoryFormData.color"></a-input>
      <a-alert message="Error" :description="scheduleCategoryFormErrorMessage" type="error" class="mb-2" v-if="scheduleCategoryFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!scheduleCategoryFormData._id" @click="createScheduleCategory()">Create</a-button>
        <a-button type="primary" size="large" block v-if="scheduleCategoryFormData._id" @click="updateScheduleCategory()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="scheduleCategoryFormData._id" @click="deleteScheduleCategory()">Delete</a-button>
      </a-flex>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {
    this.getSchedules();
    this.getScheduleCategories();
  },
  data() {
    return {
      show: [],
      scheduleEditOverlayVisible: false,
      scheduleCategoryEditOverlayVisible: false,
      scheduleSelect: true,
      scheduleBind: false,
      scheduleFormData: {
        title: '',
        scheduleCategoryID: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10),
        comments: ''
      },
      scheduleFormErrorMessage: '',
      scheduleCategoryFormData: {
        title: '',
        description: '',
        color: '#ff0000'
      },
      scheduleCategoryFormErrorMessage: '',
      schedules: [
        {
          _id: 'antoine',
          title: 'Florian.Antoine',
          scheduleCategoryID: 'red',
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date().toISOString().substring(0, 10),
          comments: 'Well not sure'
        },
        {
          _id: 'dave',
          title: 'unknown.dave',
          scheduleCategoryID: 'green',
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date().toISOString().substring(0, 10),
          comments: 'Well not sure'
        },
        {
          _id: 'jen',
          title: 'Iguana.Jenna',
          scheduleCategoryID: 'green',
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date().toISOString().substring(0, 10),
          comments: 'Well not sure'
        }
      ],
      scheduleCategories: [
        {
          _id: 'red',
          title: 'Red G',
          description: 'Red Group',
          color: 'red'
        },
        {
          _id: 'green',
          title: 'St. George South',
          description: 'Green Group',
          color: 'green'
        }
      ],
      colors: ['white', 'red', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange'],
      scheduleFilterSettings: {
        details: false,
        search: ''
      }
    };
  },
  methods: {
    filteredSchedules(scheduleCategory) {
      let validSchedules = [];
      this.schedules.forEach(function (schedule) {
        if (schedule.scheduleCategoryID == scheduleCategory._id) {
          validSchedules.push(schedule);
        }
      });
      return validSchedules;
    },
    getScheduleCategoryColor(schedule) {
      if (schedule.scheduleCategoryID !== '') {
        return this.scheduleCategories[this.scheduleCategories.findIndex((scheduleCategory) => scheduleCategory._id === schedule.scheduleCategoryID)].color;
      } else {
        return 'white';
      }
    },
    resetForm() {
      this.scheduleEditOverlayVisible = false;
      this.scheduleSelect = true;
      this.scheduleCreateEdit = false;
      this.scheduleBind = false;
      this.scheduleCategoryCreateEdit = false;

      this.scheduleFormData = {
        title: '',
        scheduleCategoryID: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10),
        comments: ''
      };
      this.scheduleFormErrorMessage = '';

      this.scheduleCategoryFormData = {
        title: '',
        description: '',
        color: 'white'
      };
      this.scheduleCategoryFormErrorMessage = '';
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
          scheduleCategoryID: this.scheduleFormData.scheduleCategoryID,
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    configureUpdateScheduleForm(schedule) {
      this.scheduleFormData.title = schedule.title;
      this.scheduleFormData.scheduleCategoryID = schedule.scheduleCategoryID;
      this.scheduleFormData._id = schedule._id;
      this.scheduleFormData.comments = schedule.comments;
      let tempStartDate = new Date(schedule.startDate).toLocaleString('en-US').substring(0, 16);
      this.scheduleFormData.startDate = tempStartDate.split('/')[2].substring(0, 4) + '-';

      if (tempStartDate.split('/')[0].length == 1) {
        this.scheduleFormData.startDate = this.scheduleFormData.startDate + '0' + tempStartDate.split('/')[0] + '-';
      } else {
        this.scheduleFormData.startDate = this.scheduleFormData.startDate + tempStartDate.split('/')[0] + '-';
      }

      if (tempStartDate.split('/')[1].length == 1) {
        this.scheduleFormData.startDate = this.scheduleFormData.startDate + '0' + tempStartDate.split('/')[1];
      } else {
        this.scheduleFormData.startDate = this.scheduleFormData.startDate + tempStartDate.split('/')[1];
      }

      let tempEndDate = new Date(schedule.endDate).toLocaleString('en-US').substring(0, 16);
      this.scheduleFormData.endDate = tempEndDate.split('/')[2].substring(0, 4) + '-';

      if (tempEndDate.split('/')[0].length == 1) {
        this.scheduleFormData.endDate = this.scheduleFormData.endDate + '0' + tempEndDate.split('/')[0] + '-';
      } else {
        this.scheduleFormData.endDate = this.scheduleFormData.endDate + tempEndDate.split('/')[0] + '-';
      }

      if (tempEndDate.split('/')[1].length == 1) {
        this.scheduleFormData.endDate = this.scheduleFormData.endDate + '0' + tempEndDate.split('/')[1];
      } else {
        this.scheduleFormData.endDate = this.scheduleFormData.endDate + tempEndDate.split('/')[1];
      }

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
          scheduleCategoryID: this.scheduleFormData.scheduleCategoryID,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex((schedule) => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

            this.resetForm();
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

            this.resetForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    getScheduleCategories() {
      fetch('/api/v1/schedule-categories', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.scheduleCategories = data.data.scheduleCategories;
          }
        });
      });
    },
    createScheduleCategory() {
      fetch('/api/v1/schedule-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleCategoryFormData.title,
          description: this.scheduleCategoryFormData.description,
          color: this.scheduleCategoryFormData.color
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.scheduleCategories.push(data.data.scheduleCategory);
            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        });
      });
    },
    configureUpdateScheduleCategoryForm(scheduleCategory) {
      this.scheduleCategoryFormData.title = scheduleCategory.title;
      this.scheduleCategoryFormData.description = scheduleCategory.description;
      this.scheduleCategoryFormData.color = scheduleCategory.color;
      this.scheduleCategoryFormData._id = scheduleCategory._id;

      this.scheduleCategoryEditOverlayVisible = true;
    },
    updateScheduleCategory() {
      fetch('/api/v1/schedule-categories/' + this.scheduleCategoryFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleCategoryFormData.title,
          description: this.scheduleCategoryFormData.description,
          color: this.scheduleCategoryFormData.color
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedScheduleCategory = this.scheduleCategories.findIndex((scheduleCategory) => scheduleCategory._id === data.data.scheduleCategory._id);
            this.scheduleCategories[indexOfUpdatedScheduleCategory] = data.data.scheduleCategory;

            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteScheduleCategory() {
      fetch('/api/v1/schedule-categories/' + this.scheduleCategoryFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            this.getSchedules();
            this.getScheduleCategories();
            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
