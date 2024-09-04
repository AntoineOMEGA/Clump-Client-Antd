<template>
  <a-drawer :open="visible" @close="close()">
    <a-spin :spinning="eventLoading">
      <a-form>
        <div class="mb-2" v-if="!eventFormData._id">
          Event Template
          <a-select v-on:change="applyEventTemplate(eventFormData.eventTemplateID)" v-model:value="eventFormData.eventTemplateID" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))" :value="eventTemplate._id" :key="eventTemplate._id">{{ eventTemplate.title }}</a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          Title
          <a-input size="large" v-model:value="eventFormData.title" allowClear></a-input>
        </div>

        <div class="mb-2">
          Location
          <a-input size="large" v-model:value="eventFormData.location" allowClear></a-input>
        </div>

        <div class="mb-2">
          Description
          <a-textarea size="large" v-model:value="eventFormData.description" allowClear></a-textarea>
        </div>

        <div class="mb-2">
          Time Zone
          <a-select v-model:value="eventFormData.timeZone" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="timeZone in timeZones" :value="timeZone" :key="timeZone">
              {{ timeZone }}
            </a-select-option>
          </a-select>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Time
              <a-time-picker size="large" v-model:value="eventFormData.startTime" format="h:mm A" :minute-step="5" allowClear></a-time-picker>
            </div>
            <div>
              End Time
              <a-time-picker size="large" v-model:value="eventFormData.endTime" format="h:mm A" :minute-step="5" allowClear></a-time-picker>
            </div>
          </a-flex>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Date
              <a-date-picker size="large" v-model:value="eventFormData.startDate" format="MM-DD-YYYY" allowClear></a-date-picker>
            </div>
            <div>
              End Date
              <a-date-picker size="large" v-model:value="eventFormData.endDate" format="MM-DD-YYYY" allowClear></a-date-picker>
            </div>
          </a-flex>
        </div>

        <!-- <div v-if="eventFormData._id" class="mb-2">
          Attendees
          <a-select v-model:value="attendees" size="large" style="width: 100%" allowClear mode="multiple">
            <a-select-option v-for="schedule in schedules.sort()" :value="schedule._id" :key="schedule._id">
              {{ schedule.title }}
            </a-select-option>
          </a-select>
        </div> -->

        <a-button type="primary" style="margin: 10px" @click="recurrenceRuleModalVisible = true">Repeat Event</a-button>
      </a-form>

      <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2" v-if="eventFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle" class="mb-2">
        <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateDecision()">Save</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block danger @click="deleteDecision()">Delete</a-button>
      </a-flex>

      <a-popover v-model:open="eventUpdatePopoverVisible" title="Update Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="updateThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="updateThisAndFollowingEvents()">This and Following Events</a-button>
          <a-button type="primary" style="margin: 10px" @Click="updateAllEvents()">All Events</a-button>
        </template>
      </a-popover>

      <a-popover v-model:open="eventDeletePopoverVisible" title="Delete Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="deleteThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteThisAndFollowingEvents()">This and Following Events</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteAllEvents()">All Events</a-button>
        </template>
      </a-popover>

      <RecurrenceRuleEditor :visible="recurrenceRuleModalVisible" :recurrenceRule="event.recurrenceRule" @confirm-recurrence-rule="setRecurrenceRule" @close="recurrenceRuleModalVisible = false" />
    </a-spin>
  </a-drawer>
</template>

<script setup>
import RecurrenceRuleEditor from './RecurrenceRuleEditor.vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() {},
  props: ['visible', 'scheduleID', 'event'],
  emits: ['close'],
  updated() {
    if (this.visible) {
      this.configureEventForm(this.event);
      this.getEventTemplates();
    }
  },
  data() {
    return {
      eventUpdatePopoverVisible: false,
      eventDeletePopoverVisible: false,
      recurrenceRuleModalVisible: false,

      eventLoading: false,
      eventFormErrorMessage: '',
      eventFormData: {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: dayjs(),
        endDate: dayjs(),
        startTime: dayjs(),
        endTime: dayjs(),
        scheduleID: this.scheduleID,
        eventTemplateID: ''
      },
      timeZones: new Intl.Locale('en-US').timeZones,

      recurrenceRule: {},
      eventTemplates: []
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
    resetEventForm() {
      this.eventUpdatePopoverVisible = false;
      this.eventDeletePopoverVisible = false;

      this.eventFormData = {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: dayjs(),
        endDate: dayjs(),
        startTime: dayjs(),
        endTime: dayjs(),
        parentEventID: '',
        scheduleID: this.scheduleID
      };

      this.eventFormErrorMessage = '';
      this.eventLoading = false;
    },
    close() {
      this.resetEventForm();
      this.$emit('close');
    },
    createEventBody() {
      let eventBody = {};

      eventBody = {
        title: this.eventFormData.title,
        description: this.eventFormData.description,
        location: this.eventFormData.location,
        startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()),
        endDateTime: this.eventFormData.endDate.hour(dayjs(this.eventFormData.endTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.endTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.endTime, 'HH:mm:ss').second()),

        scheduleID: this.scheduleID,
        //scheduleID: this.eventFormData.scheduleID,
        parentEventID: this.eventFormData.parentEventID,
        recurrenceRule: this.recurrenceRule
      };

      return eventBody;
    },
    createEvent() {
      this.eventLoading = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    configureEventForm(event) {
      this.eventFormData._id = event._id;

      this.eventFormData.title = event.title;
      this.eventFormData.description = event.description;
      this.eventFormData.location = event.location;

      this.eventFormData.startDate = dayjs(event.startDateTime);
      this.eventFormData.endDate = dayjs(event.startDateTime);
      this.eventFormData.startTime = dayjs(event.startDateTime);
      this.eventFormData.endTime = dayjs(event.endDateTime);

      this.eventFormData.scheduleID = event.scheduleID;
      this.eventFormData.parentEventID = event.parentEventID;
      this.eventFormData.isInstance = event.isInstance;
    },
    applyEventTemplate(eventTemplateID) {
      if (eventTemplateID != null) {
        let indexOfEventTemplate = this.eventTemplates.findIndex((eventTemplate) => eventTemplate._id === eventTemplateID);
        let eventTemplateToApply = this.eventTemplates[indexOfEventTemplate];
        this.eventFormData.title = eventTemplateToApply.title;
        this.eventFormData.location = eventTemplateToApply.location;
        this.eventFormData.description = eventTemplateToApply.description;
        this.eventFormData.tags = eventTemplateToApply.tags;
      } else {
        this.eventFormData.title = '';
        this.eventFormData.location = '';
        this.eventFormData.description = '';
        this.eventFormData.tags = '';
      }
    },
    updateDecision() {
      if (this.eventFormData.isInstance && this.eventFormData.isInstance === true) {
        this.eventUpdatePopoverVisible = true;
      } else {
        this.updateEvent();
      }
    },
    updateEvent() {
      this.eventLoading = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 200) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    updateThisEvent() {
      this.eventLoading = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/thisEvent/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 201) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    updateThisAndFollowingEvents() {
      this.eventLoading = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/thisAndFollowingEvents/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 201) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    updateAllEvents() {
      this.eventLoading = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/allEvents/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 200) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    deleteDecision() {
      if (this.eventFormData.isInstance && this.eventFormData.isInstance === true) {
        this.eventDeletePopoverVisible = true;
      } else {
        this.deleteEvent();
      }
    },
    deleteEvent() {
      this.eventLoading = true;
      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.resetEventForm();
        } else {
          response.json().then((data) => {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          });
        }
      });
    },
    deleteThisEvent() {
      this.eventLoading = true;
      let eventBody = { scheduleID: this.eventFormData.scheduleID, startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()) };

      fetch('/api/v1/events/thisEvent/' + this.eventFormData._id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 201) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    deleteThisAndFollowingEvents() {
      this.eventLoading = true;
      let eventBody = {
        startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()),
        untilDateTime: dayjs(this.eventFormData.untilDateTime)
      };

      fetch('/api/v1/events/thisAndFollowingEvents/' + this.eventFormData._id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventLoading = false;
          if (response.status === 200) {
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          }
        });
      });
    },
    deleteAllEvents() {
      this.eventLoading = true;
      fetch('/api/v1/events/allEvents/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.resetEventForm();
        } else {
          response.json().then((data) => {
            this.eventFormErrorMessage = data.message;
            this.eventLoading = false;
          });
        }
      });
    },
    setRecurrenceRule(recurrenceRule) {
      console.log(recurrenceRule);
      this.recurrenceRule = recurrenceRule;
      this.recurrenceRuleModalVisible = false;
    }
  }
};
</script>
