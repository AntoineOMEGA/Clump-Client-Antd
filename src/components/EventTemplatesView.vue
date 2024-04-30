<template>
  <a-button @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible">
    <PlusCircleOutlined />
  </a-button>

  <a-card>
    <a-card-actions>
      <a-input placeholder="Search" v-model="eventTemplateFilterSettings.search"></a-input>
    </a-card-actions>
    <a-card-actions>
      <a-checkbox placeholder="Show Location" v-model="eventTemplateFilterSettings.location"></a-checkbox>
      <a-checkbox placeholder="Show Description" v-model="eventTemplateFilterSettings.description"></a-checkbox>
      <a-checkbox placeholder="Show Comments" v-model="eventTemplateFilterSettings.comments"></a-checkbox>
    </a-card-actions>
  </a-card>

  <div v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title) ? 1 : -1)" :key="eventTemplate._id">
    <a-card v-if="eventTemplate.title.toLowerCase().includes(eventTemplateFilterSettings.search.toLowerCase())"
      @click="configureUpdateEventTemplateForm(eventTemplate)">
      <a-card-title> {{ eventTemplate.title }} </a-card-title>
      <div v-if="eventTemplate.location && eventTemplateFilterSettings.location">
        <a-card-subtitle>Location:</a-card-subtitle>
        <a-card-text> {{ eventTemplate.location }}
        </a-card-text>
      </div>
      <div v-if="eventTemplate.description && eventTemplateFilterSettings.description">
        <a-card-subtitle>Description:</a-card-subtitle>
        <a-card-text> {{ eventTemplate.description }}
        </a-card-text>
      </div>
      <div v-if="eventTemplate.comments && eventTemplateFilterSettings.comments">
        <a-card-subtitle>Comments:</a-card-subtitle>
        <a-card-text> {{ eventTemplate.comments }}
        </a-card-text>
      </div>
    </a-card>
  </div>

  <a-drawer v-model:open="eventTemplateEditOverlayVisible">
    <a-button @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible; resetEventTemplateForm();">
      <CloseOutlined />
    </a-button>
    <a-form>
      <a-input v-model="eventTemplateFormData.title" placeholder="Title"></a-input>
      <a-input v-model="eventTemplateFormData.location" placeholder="Location"></a-input>
      <a-input v-model="eventTemplateFormData.description" placeholder="Description"></a-input>
      <a-input placeholder="Comments" v-model="eventTemplateFormData.comments"></a-input>

      <a-card>
        <a-card-title> Shifts </a-card-title>
        <a-card-text v-if="!eventTemplateFormData._id">You must create the Event Template before creating
          shifts.</a-card-text>
        <div v-if="eventTemplateFormData._id">
          <div v-for="shift in shifts" :key="shift._id">
            <a-card v-if="shift.eventTemplateID == eventTemplateFormData._id" @click="configureUpdateShiftForm(shift)">
              <a-card-title>{{ shift.startTime + ' - ' + shift.endTime }}</a-card-title>
            </a-card>
          </div>
          <a-button @click="shiftEditOverlayVisible = !shiftEditOverlayVisible">New Shift</a-button>
        </div>
      </a-card>

      <a-card v-if="eventTemplateFormErrorMessage != ''">
        <a-card-title>{{ eventTemplateFormErrorMessage }}</a-card-title>
      </a-card>

      <div>
        <a-button v-if="!eventTemplateFormData._id" @click="createEventTemplate()">Create</a-button>
        <a-button v-if="eventTemplateFormData._id" @click="updateEventTemplate()">Save</a-button>
        <a-button v-if="eventTemplateFormData._id" @click="deleteEventTemplate()">Delete</a-button>
      </div>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="shiftEditOverlayVisible">
    <a-button @click="shiftEditOverlayVisible = !shiftEditOverlayVisible; resetShiftForm();">
      <CloseOutlined />
    </a-button>
    <a-form>
      <div>
        <a-select placeholder="Start Time" v-model="shiftFormData.startTime"></a-select>
      </div>

      <div>
        <a-select placeholder="End Time" v-model="shiftFormData.endTime"></a-select>
      </div>

      <a-card v-if="shiftFormErrorMessage != ''">
        <a-card-title>{{ shiftFormErrorMessage }}</a-card-title>
      </a-card>

      <div>
        <a-button v-if="!shiftFormData._id" @click="createShift()">Create</a-button>
        <a-button v-if="shiftFormData._id" @click="updateShift()">Save</a-button>
        <a-button v-if="shiftFormData._id" @click="deleteShift()">Delete</a-button>
      </div>
    </a-form>
  </a-drawer>
</template>

<script setup>
//
</script>

<script>
export default {
  mounted() {
    this.getEventTemplates();
    this.getShifts();
  },
  data() {
    return {
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
        search: '',
      },
      shiftEditOverlayVisible: false,
      shiftFormData: {
        startTime: '',
        endTime: ''
      },
      shiftFormErrorMessage: '',
      shifts: [],
      showShifts: false,
    }
  },
  methods: {
    getEventTemplates() {
      fetch('/api/v1/event-templates', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.eventTemplates = data.data.eventTemplates;
          }
        })
      })
    },
    resetEventTemplateForm() {
      this.eventTemplateFormData = {
        title: '',
        location: '',
        description: '',
      }
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.eventTemplates.push(data.data.eventTemplate);
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        })
      })
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            let indexOfUpdatedEventTemplate = this.eventTemplates.findIndex(eventTemplate => eventTemplate._id === data.data.eventTemplate._id);
            this.eventTemplates[indexOfUpdatedEventTemplate] = data.data.eventTemplate;
            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        })
      })
    },
    deleteEventTemplate() {
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'DELETE',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 204) {
            let indexOfDeletedEventTemplate = this.eventTemplates.findIndex(eventTemplate => eventTemplate._id === this.eventTemplateFormData._id);
            this.eventTemplates.splice(indexOfDeletedEventTemplate, 1);

            this.resetEventTemplateForm();
          } else {
            this.eventTemplateFormErrorMessage = data.message;
          }
        })
      })
    },

    getShifts() {
      fetch('/api/v1/shifts', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.shifts = data.data.shifts;
          }
        })
      })
    },
    resetShiftForm() {
      this.shiftFormData = {
        startTime: '',
        endTime: '',
      }
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
          endTime: this.shiftFormData.endTime,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.shifts.push(data.data.shift);
            this.resetShiftForm();
          } else {
            this.shiftFormErrorMessage = data.message;
          }
        })
      })
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            let indexOfUpdatedShift = this.shifts.findIndex(shift => shift._id === data.data.shift._id);
            this.shifts[indexOfUpdatedShift] = data.data.shift;
            this.resetShiftForm();
          } else {
            this.shiftFormErrorMessage = data.message;
          }
        })
      })
    },
    deleteShift() {
      fetch('/api/v1/shifts/' + this.shiftFormData._id, {
        method: 'DELETE',
      }).then(response => {
        if (response.status === 204) {
          let indexOfDeletedShift = this.shifts.findIndex(shift => shift._id === this.shiftFormData._id);
          this.shifts.splice(indexOfDeletedShift, 1);

          this.resetShiftForm();
        } else {
          this.shiftFormErrorMessage = response.status;
        }
      })
    },
  }
}
</script>