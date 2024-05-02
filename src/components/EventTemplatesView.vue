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

  <a-flex style="padding: 8px; padding-right: 20px" justify="right">
    <a @click="toggleMoreDetails = !toggleMoreDetails">Show Details</a>
  </a-flex>

  <div v-for="eventTemplate in  eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1)) " :key="eventTemplate._id">
    <a-card style="margin: 10px;" v-if="eventTemplate.title.toLowerCase().includes(eventTemplateFilterSettings.search.toLowerCase())
      " :title="eventTemplate.title">
      <template #extra><edit-outlined style="font-size: 1.5rem" key="edit"
          @click="configureUpdateEventTemplateForm(eventTemplate)" /></template>
      <a-descriptions v-if="toggleMoreDetails" bordered>
        <a-descriptions-item label="Location">{{ eventTemplate.location }}</a-descriptions-item>
        <a-descriptions-item label="Description">{{ eventTemplate.description }}</a-descriptions-item>
        <a-descriptions-item label="Comments">{{ eventTemplate.comments }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>

  <a-drawer v-model:open="eventTemplateEditOverlayVisible" @close="resetEventTemplateForm()">
    <a-form>
      <a-input v-model:value="eventTemplateFormData.title" addonBefore="Title" class="mb-2"></a-input>
      <a-input v-model:value="eventTemplateFormData.location" addonBefore="Location" class="mb-2"></a-input>
      <a-input v-model:value="eventTemplateFormData.description" addonBefore="Description" class="mb-2"></a-input>
      <a-input addonBefore="Comments" v-model:value="eventTemplateFormData.comments" class="mb-2"></a-input>

      <a-card class="mb-2">
        <a-card-meta title="Shifts"></a-card-meta>
        <p v-if="!eventTemplateFormData._id">
          You must create the Event Template before creating shifts.
        </p>
        <div v-if="eventTemplateFormData._id">
          <div v-for=" shift  in  shifts " :key="shift._id">
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
      <div>
        <a-time-picker class="mb-2" addonBefore="Start Time" size="large" format="hh:mm A" use12-hours :minute-step="15"
          v-model:value="shiftFormData.startTime"></a-time-picker>
      </div>

      <div>
        <a-time-picker class="mb-2" addonBefore="End Time" size="large" format="hh:mm A" use12-hours :minute-step="15"
          v-model:value="shiftFormData.endTime" valueFormat="HH:mm A"></a-time-picker>
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
</template>

<script setup>
import { EditOutlined, PlusOutlined } from '@ant-design/icons-vue'

//
</script>

<script>
export default {
  mounted() {
    this.getEventTemplates()
    this.getShifts()
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
      eventTemplates: [
        {
          _id: 'red',
          title: 'Red',
          location: '30 N 80 E Main St.',
          description: 'Red Rocks are super awesome! Help the rocks thrive.',
          comments: 'Red Too is a super long comment that is completely unnecessary but needed for this test of how the formatting works.'
        },
        {
          _id: 'green',
          title: 'Green',
          location: 'Green Tree',
          description: 'Green Rocks',
          comments: 'Green Too'
        },
        {
          _id: 'blue',
          title: 'Blue',
          location: 'Blue Tree',
          description: 'Blue Rocks',
          comments: 'Blue Too'
        }
      ],
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
      showShifts: false,
      toggleMoreDetails: false
    }
  },
  methods: {
    getEventTemplates() {
      fetch('/api/v1/event-templates', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.eventTemplates = data.data.eventTemplates
          }
        })
      })
    },
    resetEventTemplateForm() {
      this.eventTemplateFormData = {
        title: '',
        location: '',
        description: ''
      }
      this.eventTemplateEditOverlayVisible = false
      this.eventTemplateFormErrorMessage = ''
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
            this.eventTemplates.push(data.data.eventTemplate)
            this.resetEventTemplateForm()
          } else {
            this.eventTemplateFormErrorMessage = data.message
          }
        })
      })
    },
    configureUpdateEventTemplateForm(eventTemplate) {
      this.eventTemplateFormData._id = eventTemplate._id
      this.eventTemplateFormData.title = eventTemplate.title
      this.eventTemplateFormData.description = eventTemplate.description
      this.eventTemplateFormData.location = eventTemplate.location
      this.eventTemplateFormData.comments = eventTemplate.comments

      this.eventTemplateEditOverlayVisible = true
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
            let indexOfUpdatedEventTemplate = this.eventTemplates.findIndex(
              (eventTemplate) => eventTemplate._id === data.data.eventTemplate._id
            )
            this.eventTemplates[indexOfUpdatedEventTemplate] = data.data.eventTemplate
            this.resetEventTemplateForm()
          } else {
            this.eventTemplateFormErrorMessage = data.message
          }
        })
      })
    },
    deleteEventTemplate() {
      fetch('/api/v1/event-templates/' + this.eventTemplateFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            let indexOfDeletedEventTemplate = this.eventTemplates.findIndex(
              (eventTemplate) => eventTemplate._id === this.eventTemplateFormData._id
            )
            this.eventTemplates.splice(indexOfDeletedEventTemplate, 1)

            this.resetEventTemplateForm()
          } else {
            this.eventTemplateFormErrorMessage = data.message
          }
        })
      })
    },

    getShifts() {
      fetch('/api/v1/shifts', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.shifts = data.data.shifts
          }
        })
      })
    },
    resetShiftForm() {
      this.shiftFormData = {
        startTime: '',
        endTime: ''
      }
      this.shiftEditOverlayVisible = false
      this.shiftFormErrorMessage = ''
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
            this.shifts.push(data.data.shift)
            this.resetShiftForm()
          } else {
            this.shiftFormErrorMessage = data.message
          }
        })
      })
    },
    configureUpdateShiftForm(shift) {
      this.shiftFormData._id = shift._id
      this.shiftFormData.startTime = shift.startTime
      this.shiftFormData.endTime = shift.endTime

      this.shiftEditOverlayVisible = true
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
            let indexOfUpdatedShift = this.shifts.findIndex(
              (shift) => shift._id === data.data.shift._id
            )
            this.shifts[indexOfUpdatedShift] = data.data.shift
            this.resetShiftForm()
          } else {
            this.shiftFormErrorMessage = data.message
          }
        })
      })
    },
    deleteShift() {
      fetch('/api/v1/shifts/' + this.shiftFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          let indexOfDeletedShift = this.shifts.findIndex(
            (shift) => shift._id === this.shiftFormData._id
          )
          this.shifts.splice(indexOfDeletedShift, 1)

          this.resetShiftForm()
        } else {
          this.shiftFormErrorMessage = response.status
        }
      })
    }
  }
}
</script>