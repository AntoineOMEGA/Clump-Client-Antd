<template>
  <a-button color="white" icon rounded="pill" density="compact"
    style="position: fixed; bottom: 150px; right: 10px; z-index: 100; height: 60px; width: 60px;"
    @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible">
    <a-icon color="pink" style="font-size: 3.5rem">mdi-plus-circle</a-icon>
  </a-button>

  <a-card class="mb-5">
    <a-card-actions>
      <a-input hide-details="auto" label="Search" a-model="eventTemplateFilterSettings.search"></a-input>
    </a-card-actions>
    <a-card-actions>
      <a-checkbox hide-details="auto" label="Show Location" a-model="eventTemplateFilterSettings.location"></a-checkbox>
      <a-checkbox hide-details="auto" label="Show Description"
        a-model="eventTemplateFilterSettings.description"></a-checkbox>
      <a-checkbox hide-details="auto" label="Show Comments" a-model="eventTemplateFilterSettings.comments"></a-checkbox>
    </a-card-actions>
  </a-card>

  <div a-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title) ? 1 : -1)" :key="eventTemplate._id">
    <a-card a-if="eventTemplate.title.toLowerCase().includes(eventTemplateFilterSettings.search.toLowerCase())"
      class="mb-4" @click="configureUpdateEventTemplateForm(eventTemplate)">
      <a-card-title class="bebas-neue-regular"> {{ eventTemplate.title }} </a-card-title>
      <div a-if="eventTemplate.location && eventTemplateFilterSettings.location">
        <a-card-subtitle>Location:</a-card-subtitle>
        <a-card-text> {{ eventTemplate.location }}
        </a-card-text>
      </div>
      <div a-if="eventTemplate.description && eventTemplateFilterSettings.description">
        <a-card-subtitle>Description:</a-card-subtitle>
        <a-card-text style="white-space: pre-line"> {{ eventTemplate.description }}
        </a-card-text>
      </div>
      <div a-if="eventTemplate.comments && eventTemplateFilterSettings.comments">
        <a-card-subtitle>Comments:</a-card-subtitle>
        <a-card-text style="white-space: pre-line"> {{ eventTemplate.comments }}
        </a-card-text>
      </div>
    </a-card>
  </div>

  <a-drawer a-model="eventTemplateEditOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black"
    scroll-strategy="block" width="100%" style="overflow-y: scroll !important" persistent>
    <a-container align="right">
      <a-button @click="eventTemplateEditOverlayVisible = !eventTemplateEditOverlayVisible; resetEventTemplateForm();"
        icon variant="text">
        <a-icon color="red-accent-3" size="x-large">mdi-close</a-icon>
      </a-button>
    </a-container>
    <a-container>
      <a-form>
        <a-input a-model="eventTemplateFormData.title" label="Title"></a-input>
        <a-input a-model="eventTemplateFormData.location" label="Location"></a-input>
        <a-textarea a-model="eventTemplateFormData.description" label="Description"></a-textarea>
        <a-textarea label="Comments" a-model="eventTemplateFormData.comments"></a-textarea>

        <a-card class="mb-4">
          <a-card-title class="bebas-neue-regular"> Shifts </a-card-title>
          <a-card-text a-if="!eventTemplateFormData._id">You must create the Event Template before creating
            shifts.</a-card-text>
          <div class="pa-2 mt-2" a-if="eventTemplateFormData._id">
            <div a-for="shift in shifts" :key="shift._id">
              <a-card a-if="shift.eventTemplateID == eventTemplateFormData._id" class="mb-4 bg-grey-darken-3"
                @click="configureUpdateShiftForm(shift)">
                <a-card-title>{{ shift.startTime + ' - ' + shift.endTime }}</a-card-title>
              </a-card>
            </div>
            <a-button size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
              @click="shiftEditOverlayVisible = !shiftEditOverlayVisible">New Shift</a-button>
          </div>
        </a-card>

        <a-card class="bg-red-accent-3 mb-5" a-if="eventTemplateFormErrorMessage != ''">
          <a-card-title>{{ eventTemplateFormErrorMessage }}</a-card-title>
        </a-card>

        <div class="d-flex justify-space-between">
          <a-button a-if="!eventTemplateFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular"
            rounded="pill" @click="createEventTemplate()">Create</a-button>
          <a-button a-if="eventTemplateFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular"
            rounded="pill" @click="updateEventTemplate()">Save</a-button>
          <a-button a-if="eventTemplateFormData._id" size="x-large" class="bg-red-accent-3 bebas-neue-regular"
            rounded="pill" @click="deleteEventTemplate()">Delete</a-button>
        </div>
      </a-form>
    </a-container>
  </a-drawer>

  <a-drawer a-model="shiftEditOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black"
    scroll-strategy="block" width="100%" style="overflow-y: scroll !important" persistent>
    <a-container align="right">
      <a-button @click="shiftEditOverlayVisible = !shiftEditOverlayVisible; resetShiftForm();" icon variant="text">
        <a-icon color="red-accent-3" size="x-large">mdi-close</a-icon>
      </a-button>
    </a-container>
    <a-container>
      <a-form>
        <div class="d-flex justify-space-between">
          <a-select :items="generateTimes" label="Start Time" a-model="shiftFormData.startTime"></a-select>
        </div>

        <div class="d-flex justify-space-between">
          <a-select :items="generateTimes" label="End Time" a-model="shiftFormData.endTime"></a-select>
        </div>

        <a-card class="bg-red-accent-3 mb-5" a-if="shiftFormErrorMessage != ''">
          <a-card-title>{{ shiftFormErrorMessage }}</a-card-title>
        </a-card>

        <div class="d-flex justify-space-between">
          <a-button a-if="!shiftFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
            @click="createShift()">Create</a-button>
          <a-button a-if="shiftFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
            @click="updateShift()">Save</a-button>
          <a-button a-if="shiftFormData._id" size="x-large" class="bg-red-accent-3 bebas-neue-regular" rounded="pill"
            @click="deleteShift()">Delete</a-button>
        </div>
      </a-form>
    </a-container>
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
  computed: {
    generateTimes() {
      let tempTimes = [];
      let sH = 0;
      let sM = 0;
      let times = [];

      while (sH != 24) {
        tempTimes.push(sH + ":" + sM);
        if (sM == 45) {
          sH += 1;
          sM = 0;
        } else {
          sM = sM + 15;
        }
      }

      tempTimes.forEach(function (time) {
        let hour = time.split(":")[0];
        let min = time.split(":")[1];

        let pMin;
        let pTime;

        if (min < 10) {
          pMin = "0" + min;
        } else {
          pMin = min;
        }

        if (hour < 12 && hour > 0) {
          pTime = hour + ":" + pMin + " AM";
        } else if (hour == 12) {
          pTime = 12 + ":" + pMin + " PM";
        } else if (hour > 12 && hour != 24) {
          var tH = hour % 12;
          pTime = tH + ":" + pMin + " PM";
        } else if (hour == 0) {
          pTime = 12 + ":" + pMin + " AM";
        } else {
          console.log("Error")
        }

        times.push(pTime);
      })

      return times;
    },
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