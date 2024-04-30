<template>
  <a-button color="white" icon rounded="pill" density="compact"
    style="position: fixed; bottom: 150px; right: 10px; z-index: 100; height: 60px; width: 60px;"
    @click="scheduleEditOverlayVisible = !scheduleEditOverlayVisible">
    <a-icon color="pink" style="font-size: 3.5rem">mdi-plus-circle</a-icon>
  </a-button>

  <div a-for="scheduleCategory in scheduleCategories.sort((a, b) => (a.title > b.title) ? 1 : -1)"
    :key="scheduleCategory._id">
    <a-card class="mb-4">
      <a-card-title class="bebas-neue-regular" :class="'text-' + scheduleCategory.color"> {{ scheduleCategory.title }}
      </a-card-title>
      <a-card-subtitle a-if="scheduleCategory.description != ''" class="mb-4"> {{ scheduleCategory.description }}
      </a-card-subtitle>
      <a-card-actions>
        <a-button @click="configureUpdateScheduleCategoryForm(scheduleCategory)" icon variant="text">
          <a-icon>mdi-pencil</a-icon>
        </a-button>
        <a-spacer></a-spacer>
        <a-button :icon="show[scheduleCategory._id] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="show[scheduleCategory._id] = !show[scheduleCategory._id]"></a-button>
      </a-card-actions>

      <a-expand-transition>
        <div a-show="show[scheduleCategory._id]">
          <a-divider></a-divider>
          <a-card flat>
            <a-card-item>
              <a-input hide-details="auto" label="Search" a-model="scheduleFilterSettings.search" clearable></a-input>
              <a-checkbox hide-details="auto" label="Show Details"
                a-model="scheduleFilterSettings.details"></a-checkbox>
            </a-card-item>
          </a-card>
          <div class="pa-2">
            <div a-for="schedule in filteredSchedules(scheduleCategory).sort((a, b) => (a.title > b.title) ? 1 : -1)"
              :key="schedule._id">
              <a-card a-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())"
                class="mb-2" color="grey-darken-3" @click="configureUpdateScheduleForm(schedule)">
                <a-card-title class="bebas-neue-regular" :class="'text-' + getScheduleCategoryColor(schedule)"> {{
      schedule.title }}
                </a-card-title>
                <a-card-text a-if="schedule.comments != '' && scheduleFilterSettings.details"
                  style="white-space: pre-line">
                  {{ schedule.comments }}
                </a-card-text>
              </a-card>
            </div>
          </div>
        </div>
      </a-expand-transition>
    </a-card>
  </div>

  <a-drawer a-model="scheduleEditOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black"
    scroll-strategy="block" width="100%" style="overflow-y: scroll !important" persistent>
    <a-layout align="right">
      <a-button @click="resetForm()" icon variant="text">
        <a-icon color="red-accent-3" size="x-large">mdi-close</a-icon>
      </a-button>
    </a-layout>

    <!--Select Action-->
    <a-layout a-if="scheduleSelect">
      <a-form>
        <div>
          <a-button size="x-large" class="bg-light-blue mb-8 pa-8 bebas-neue-regular" rounded="pill" block
            @click="scheduleCreateEdit = true; scheduleSelect = false;">Create Schedule</a-button>
          <a-button size="x-large" class="bg-light-blue mb-8 pa-8 bebas-neue-regular" rounded="pill" block
            @click="scheduleCategoryCreateEdit = true; scheduleSelect = false">Create Category</a-button>
        </div>
      </a-form>
    </a-layout>

    <!--Create/Edit Schedule-->
    <a-layout a-if="scheduleCreateEdit">
      <a-form>
        <a-input a-model="scheduleFormData.title" label="Title"></a-input>
        <a-select label="Category" a-model="scheduleFormData.scheduleCategoryID" :items="scheduleCategories"
          item-title="title" item-value="_id"></a-select>
        <div class="d-flex justify-space-between">
          <a-input label="Start Date" a-model="scheduleFormData.startDate" type="date" class="mr-4"></a-input>
          <a-input label="End Date" a-model="scheduleFormData.endDate" type="date"></a-input>
        </div>
        <a-textarea label="Comments" a-model="scheduleFormData.comments"></a-textarea>

        <a-card class="bg-red-accent-3 mb-5" a-if="scheduleFormErrorMessageVisible">
          <a-card-title>{{ scheduleFormErrorMessage }}</a-card-title>
        </a-card>

        <div class="d-flex justify-space-between">
          <a-button a-if="!scheduleFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
            @click="createSchedule()">Create</a-button>
          <a-button a-if="scheduleFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
            @click="updateSchedule()">Save</a-button>
          <a-button a-if="scheduleFormData._id" size="x-large" class="bg-red-accent-3 bebas-neue-regular" rounded="pill"
            @click="deleteSchedule()">Archive</a-button>
        </div>
      </a-form>
    </a-layout>

    <!--Create/Edit Schedule Category-->
    <a-layout a-if="scheduleCategoryCreateEdit">
      <a-form>
        <a-input a-model="scheduleCategoryFormData.title" label="Title"></a-input>
        <a-input a-model="scheduleCategoryFormData.description" label="Description"></a-input>
        <a-select label="Color" a-model="scheduleCategoryFormData.color" :items="colors"
          :color="scheduleCategoryFormData.color"></a-select>

        <a-card class="bg-red-accent-3 mb-5" a-if="scheduleCategoryFormErrorMessage != ''">
          <a-card-title>{{ scheduleCategoryFormErrorMessage }}</a-card-title>
        </a-card>

        <div class="d-flex justify-space-between">
          <a-button a-if="!scheduleCategoryFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular"
            rounded="pill" @click="createScheduleCategory()">Create</a-button>
          <a-button a-if="scheduleCategoryFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular"
            rounded="pill" @click="updateScheduleCategory()">Save</a-button>
          <a-button a-if="scheduleCategoryFormData._id" size="x-large" class="bg-red-accent-3 bebas-neue-regular"
            rounded="pill" @click="deleteScheduleCategory()">Delete</a-button>
        </div>
      </a-form>
    </a-layout>
  </a-drawer>
</template>

<script setup>
//
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
      scheduleSelect: true,
      scheduleCreateEdit: false,
      scheduleBind: false,
      scheduleCategoryCreateEdit: false,
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
        color: 'white',
      },
      scheduleCategoryFormErrorMessage: '',
      schedules: [],
      scheduleCategories: [],
      colors: ['white', 'red', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange'],
      scheduleFilterSettings: {
        details: false,
        search: ''
      }
    }
  },
  methods: {
    filteredSchedules(scheduleCategory) {
      let validSchedules = [];
      this.schedules.forEach(function (schedule) {
        if (schedule.scheduleCategoryID == scheduleCategory._id) {
          validSchedules.push(schedule);
        }
      })
      return validSchedules;
    },
    getScheduleCategoryColor(schedule) {
      if (schedule.scheduleCategoryID !== '') {
        return this.scheduleCategories[this.scheduleCategories.findIndex(scheduleCategory => scheduleCategory._id === schedule.scheduleCategoryID)].color;
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
        color: 'white',
      };
      this.scheduleCategoryFormErrorMessage = '';
    },
    getSchedules() {
      fetch('/api/v1/schedules', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.schedules = data.data.schedules;
          }
        })
      })
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        })
      })
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
      this.scheduleSelect = false;
      this.scheduleCreateEdit = true;
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
          comments: this.scheduleFormData.comments,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex(schedule => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

            this.resetForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        })
      })
    },
    deleteSchedule() {
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'DELETE',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 204) {
            let indexOfDeletedSchedule = this.schedules.findIndex(schedule => schedule._id === this.scheduleFormData._id);
            this.schedules.splice(indexOfDeletedSchedule, 1);

            this.resetForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        })
      })
    },
    getScheduleCategories() {
      fetch('/api/v1/schedule-categories', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.scheduleCategories = data.data.scheduleCategories;
          }
        })
      })
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
          color: this.scheduleCategoryFormData.color,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.scheduleCategories.push(data.data.scheduleCategory);
            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        })
      })
    },
    configureUpdateScheduleCategoryForm(scheduleCategory) {
      this.scheduleCategoryFormData.title = scheduleCategory.title;
      this.scheduleCategoryFormData.description = scheduleCategory.description;
      this.scheduleCategoryFormData.color = scheduleCategory.color;
      this.scheduleCategoryFormData._id = scheduleCategory._id;

      this.scheduleEditOverlayVisible = true;
      this.scheduleSelect = false;
      this.scheduleCategoryCreateEdit = true;
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
          color: this.scheduleCategoryFormData.color,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            let indexOfUpdatedScheduleCategory = this.scheduleCategories.findIndex(scheduleCategory => scheduleCategory._id === data.data.scheduleCategory._id);
            this.scheduleCategories[indexOfUpdatedScheduleCategory] = data.data.scheduleCategory;

            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        })
      })
    },
    deleteScheduleCategory() {
      fetch('/api/v1/schedule-categories/' + this.scheduleCategoryFormData._id, {
        method: 'DELETE'
      }).then(response => {
        response.json().then(data => {
          if (response.status === 204) {
            this.getSchedules();
            this.getScheduleCategories();
            this.resetForm();
          } else {
            this.scheduleCategoryFormErrorMessage = data.message;
          }
        })
      })
    },

  }
}
</script>