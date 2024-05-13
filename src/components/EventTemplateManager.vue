<template>
  <a-float-button type="primary" style="height: 60px; width: 60px"
    @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="eventTemplateFilterSettings.search"></a-input>
  </div>

  <div v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="eventTemplate._id">
    <a-card style="margin: 10px"
      v-if="eventTemplate.title.toLowerCase().includes(eventTemplateFilterSettings.search.toLowerCase())"
      :title="eventTemplate.title" :bodyStyle="{ padding: '0' }">
      <template #extra>
        <CalendarOutlined style="font-size: 1.5rem; margin-right: 10px" key="edit"
          @click="eventTemplateScheduleVisible = !eventTemplateScheduleVisible" />
        <EditOutlined style="font-size: 1.5rem" key="edit" @click="configureUpdateEventTemplateForm(eventTemplate)" />

      </template>
    </a-card>
  </div>

  <a-drawer v-model:open="eventTemplateEditOverlayVisible" @close="resetEventTemplateForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input v-model:value="eventTemplateFormData.title" size="large"></a-input>
      </div>

      <div class="mb-2">
        Location
        <a-input v-model:value="eventTemplateFormData.location" size="large"></a-input>
      </div>

      <div class="mb-2">
        Description
        <a-input v-model:value="eventTemplateFormData.description" size="large"></a-input>
      </div>

      <div class="mb-2">
        Comments
        <a-textarea v-model:value="eventTemplateFormData.comments" size="large"></a-textarea>
      </div>

      <a-card class="mb-2">
        <a-card-meta title="Shifts"></a-card-meta>
        <p v-if="!eventTemplateFormData._id">You must create the Event Template before creating shifts.</p>
        <div v-if="eventTemplateFormData._id">
          <div v-for="shift in shifts" :key="shift._id">
            <a-card v-if="shift.eventTemplateID == eventTemplateFormData._id" @click="configureUpdateShiftForm(shift)">
              <a-card-meta :title="shift.startTime + ' - ' + shift.endTime"></a-card-meta>
            </a-card>
          </div>
          <a-button @click="shiftEditOverlayVisible = !shiftEditOverlayVisible">New Shift</a-button>
        </div>
      </a-card>

      <a-card v-if="eventTemplateFormErrorMessage != ''">
        <a-card-meta :title="eventTemplateFormErrorMessage"></a-card-meta>
      </a-card>

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!eventTemplateFormData._id"
          @click="createEventTemplate()">Create</a-button>
        <a-button type="primary" size="large" block v-if="eventTemplateFormData._id"
          @click="updateEventTemplate()">Save</a-button>
        <a-button type="primary" size="large" block v-if="eventTemplateFormData._id"
          @click="deleteEventTemplate()">Delete</a-button>
      </a-flex>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="shiftEditOverlayVisible" @close="resetShiftForm()">
    <a-form>
      <div class="mb-2">
        <a-flex>
          <div>
            Start Time
            <a-time-picker size="large" format="hh:mm A" use12-hours :minute-step="15"
              v-model:value="shiftFormData.startTime"></a-time-picker>
          </div>

          <div>
            End Time
            <a-time-picker size="large" format="hh:mm A" use12-hours :minute-step="15"
              v-model:value="shiftFormData.endTime" valueFormat="HH:mm A"></a-time-picker>
          </div>
        </a-flex>
      </div>

      <a-card v-if="shiftFormErrorMessage != ''">
        <a-card-meta :title="shiftFormErrorMessage"></a-card-meta>
      </a-card>

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!shiftFormData._id" @click="createShift()">Create</a-button>
        <a-button type="primary" size="large" block v-if="shiftFormData._id" @click="updateShift()">Save</a-button>
        <a-button type="primary" size="large" block danger v-if="shiftFormData._id"
          @click="deleteShift()">Delete</a-button>
      </a-flex>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="eventTemplateScheduleVisible">
    <a-card style="margin-bottom: 20px; background-color: #333333">
      <a-statistic title="Total Hours" :value="480">
        <template #suffix>
          <ClockCircleOutlined />
        </template>
      </a-statistic>
    </a-card>

    <a-card title="Tuesday 17th, March 2024" :bodyStyle="{ padding: '5px' }"
      style="margin-bottom: 10px; background-color: #333">
      <a-card title="9:00am - 12:00pm | Shift" :bodyStyle="{ padding: '5px' }" style="margin-bottom: 5px">
        <template #extra>
          <a-badge color="#22a2ff" count="4" style="color: #fff">
            <UserOutlined style="font-size: 1.2rem" />
          </a-badge>
        </template>
        <a-card title="9:00am - 11:00am" style="background-color: #333" :bodyStyle="{ padding: '5px' }">
          <a-tag color="#ffb7f5"
            style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px"
            @click="console.log('hi')">Bart.Anthony</a-tag>
        </a-card>
        <a-card title="9:00am - 12:00pm" style="background-color: #333" :bodyStyle="{ padding: '5px' }">
          <a-tag color="#ffb735"
            style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px">Black.Tom</a-tag>
        </a-card>
      </a-card>
      <a-card title="1:00 - 4:00pm" :bodyStyle="{ padding: '5px' }" style="margin-bottom: 5px">
        <template #extra>
          <a-badge color="#22a2ff" count="4" style="color: #fff">
            <UserOutlined style="font-size: 1.2rem" />
          </a-badge>
        </template>
        <a-tag color="#ffb7f5"
          style="margin: 5px; padding: 5px; padding-left: 10px; padding-right: 10px; border-radius: 10px">Bart.Anthony</a-tag>

      </a-card>
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
import { EditOutlined, PlusOutlined, CalendarOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  mounted() {
    this.getEventTemplates();
    this.getShifts();
  },
  data() {
    return {
      eventTemplateScheduleVisible: false,
      eventTemplateEditOverlayVisible: false,
      eventTemplateFormData: {
        title: '',
        location: '',
        description: '',
        comments: ''
      },
      eventTemplateFormErrorMessage: '',
      eventTemplates: [],
      eventTemplateFilterSettings: {
        location: false,
        description: false,
        comments: true,
        search: ''
      },
      shiftEditOverlayVisible: false,
      shiftFormData: {
        startTime: '',
        endTime: ''
      },
      shiftFormErrorMessage: '',
      shifts: [],
      toggleMoreDetails: false
    };
  },
  methods: {
    getEventTemplates() {
      fetch('/api/v1/event-templates', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.eventTemplates = data.data.eventTemplates;
          }
        });
      });
    },
    resetEventTemplateForm() {
      this.eventTemplateFormData = {
        title: '',
        location: '',
        description: ''
      };
      this.eventTemplateEditOverlayVisible = false;
      this.eventTemplateFormErrorMessage = '';
    },
    createEventTemplate() {
      fetch('/api/v1/event-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateFormData.title,
          location: this.eventTemplateFormData.location,
          description: this.eventTemplateFormData.description,
          comments: this.eventTemplateFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.eventTemplates.push(data.data.eventTemplate);
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        });
      });
    },
    configureUpdateEventTemplateForm(eventTemplate) {
      this.eventTemplateFormData._id = eventTemplate._id;
      this.eventTemplateFormData.title = eventTemplate.title;
      this.eventTemplateFormData.description = eventTemplate.description;
      this.eventTemplateFormData.location = eventTemplate.location;
      this.eventTemplateFormData.comments = eventTemplate.comments;

      this.eventTemplateEditOverlayVisible = true;
    },
    updateEventTemplate() {
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.eventTemplateFormData.title,
          location: this.eventTemplateFormData.location,
          description: this.eventTemplateFormData.description,
          comments: this.eventTemplateFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedEventTemplate = this.eventTemplates.findIndex((eventTemplate) => eventTemplate._id === data.data.eventTemplate._id);
            this.eventTemplates[indexOfUpdatedEventTemplate] = data.data.eventTemplate;
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteEventTemplate() {
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            let indexOfDeletedEventTemplate = this.eventTemplates.findIndex((eventTemplate) => eventTemplate._id === this.eventTemplateFormData._id);
            this.eventTemplates.splice(indexOfDeletedEventTemplate, 1);

            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        });
      });
    },

    getShifts() {
      fetch('/api/v1/shifts', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.shifts = data.data.shifts;
          }
        });
      });
    },
    resetShiftForm() {
      this.shiftFormData = {
        startTime: '',
        endTime: ''
      };
      this.shiftEditOverlayVisible = false;
      this.shiftFormErrorMessage = '';
    },
    createShift() {
      fetch('/api/v1/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventTemplateID: this.eventTemplateFormData._id,
          startTime: this.shiftFormData.startTime,
          endTime: this.shiftFormData.endTime
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.shifts.push(data.data.shift);
            this.resetShiftForm();
          } else {
            this.shiftFormErrorMessage = data.message;
          }
        });
      });
    },
    configureUpdateShiftForm(shift) {
      this.shiftFormData._id = shift._id;
      this.shiftFormData.startTime = shift.startTime;
      this.shiftFormData.endTime = shift.endTime;

      this.shiftEditOverlayVisible = true;
    },
    updateShift() {
      fetch('/api/v1/shifts/' + this.shiftFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: this.shiftFormData.startTime,
          endTime: this.shiftFormData.endTime
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedShift = this.shifts.findIndex((shift) => shift._id === data.data.shift._id);
            this.shifts[indexOfUpdatedShift] = data.data.shift;
            this.resetShiftForm();
          } else {
            this.shiftFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteShift() {
      fetch('/api/v1/shifts/' + this.shiftFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          let indexOfDeletedShift = this.shifts.findIndex((shift) => shift._id === this.shiftFormData._id);
          this.shifts.splice(indexOfDeletedShift, 1);

          this.resetShiftForm();
        } else {
          this.shiftFormErrorMessage = response.status;
        }
      });
    }
  }
};
</script>
