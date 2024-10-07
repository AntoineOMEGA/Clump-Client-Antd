<template>
  <a-modal :open="visible" @ok="confirmRecurrenceRule()" @cancel="close()" title="Attendee">
    <div class="mb-2">
      Schedule
      <a-select v-model:value="eventAttendeeFormData.scheduleID" size="large" style="width: 100%" allowClear>
        <a-select-option v-for="schedule in schedules" :value="schedule._id" :key="schedule._id">
          {{ schedule.title }}
        </a-select-option>
      </a-select>
    </div>

    <div class="mb-2">
      <a-flex justify="space-around" align="middle" gap="middle">
        <div>
          Start Time
          <a-time-picker size="large" v-model:value="eventAttendeeFormData.startDateTime" format="h:mm A" :minute-step="5" allowClear></a-time-picker>
        </div>
        <div>
          End Time
          <a-time-picker size="large" v-model:value="eventAttendeeFormData.endDateTime" format="h:mm A" :minute-step="5" allowClear></a-time-picker>
        </div>
      </a-flex>
    </div>

    <div class="mb-2">
      <a-flex justify="space-around" align="middle" gap="middle">
        <div>
          Start Date
          <a-date-picker size="large" v-model:value="eventAttendeeFormData.startDateTime" format="MM-DD-YYYY" allowClear></a-date-picker>
        </div>
        <div>
          End Date
          <a-date-picker size="large" v-model:value="eventAttendeeFormData.endDateTime" format="MM-DD-YYYY" allowClear></a-date-picker>
        </div>
      </a-flex>
    </div>

    <div class="mb-2">
      End
      <a-radio-group v-model:value="eventAttendeeFormData.end" option-type="button" :options="endOptions" style="display: block" />
    </div>

    <div v-if="eventAttendeeFormData.end == 'Occurrences'" class="mb-2">
      Occurrences
      <a-input type="number" v-model:value="eventAttendeeFormData.occurrences" allowClear></a-input>
    </div>

    <div v-if="eventAttendeeFormData.end == 'Until Date'" class="mb-2">
      Until Date
      <a-date-picker size="large" v-model:value="eventAttendeeFormData.untilDateTime" format="MM-DD-YYYY" style="width: 100%" allowClear></a-date-picker>
    </div>

    <a-flex justify="space-around" align="middle" gap="middle" class="mb-2">
      <a-button v-if="!eventAttendeeFormData._id" type="primary" size="large" block @click="createEventAttendee()">Create</a-button>
      <a-button v-if="eventAttendeeFormData._id" type="primary" size="large" block @click="updateDecision()">Save</a-button>
      <a-button v-if="eventAttendeeFormData._id" type="primary" size="large" block danger @click="deleteDecision()">Delete</a-button>
    </a-flex>

    <a-popover v-model:open="eventAttendeeUpdatePopoverVisible" title="Update Instances" trigger="click">
      <template #content>
        <a-button type="primary" style="margin: 10px" @click="updateThisEventAttendee()">This EventAttendee</a-button>
        <a-button type="primary" style="margin: 10px" @click="updateThisAndFollowingEventAttendees()">This and Following EventAttendees</a-button>
        <a-button type="primary" style="margin: 10px" @Click="updateAllEventAttendees()">All EventAttendees</a-button>
      </template>
    </a-popover>

    <a-popover v-model:open="eventAttendeeDeletePopoverVisible" title="Delete Instances" trigger="click">
      <template #content>
        <a-button type="primary" style="margin: 10px" @click="deleteThisEventAttendee()">This EventAttendee</a-button>
        <a-button type="primary" style="margin: 10px" @click="deleteThisAndFollowingEventAttendees()">This and Following EventAttendees</a-button>
        <a-button type="primary" style="margin: 10px" @click="deleteAllEventAttendees()">All EventAttendees</a-button>
      </template>
    </a-popover>
  </a-modal>
</template>

<script setup>
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() {},
  updated() {
    if (this.visible) {
      this.getSchedules();
      this.configureEventAttendeeForm(this.event);
    }
  },
  props: ['visible', 'event'],
  emits: ['close', 'confirmEventAttendee'],
  data() {
    return {
      eventAttendeeUpdatePopoverVisible: false,
      eventAttendeeDeletePopoverVisible: false,

      eventAttendeeLoading: false,
      eventAttendeeFormErrorMessage: '',

      eventAttendeeFormData: {
        scheduleID: '',
        eventID: '',
        startDateTime: dayjs(),
        endDateTime: dayjs(),
        untilDateTime: dayjs(),
        occurrences: 0,
        end: 'Not Set'
      },
      endOptions: ['Not Set', 'Until Date', 'Occurrences'],
      schedules: []
    };
  },
  methods: {
    getSchedules() {
      this.schedulesLoading = true;
      fetch('/api/v1/schedules', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.schedules = data.data.schedules;
          }
          this.schedulesLoading = false;
        });
      });
    },
    close() {
      this.$emit('close');
    },
    confirmEventAttendee() {
      //this.$emit('confirmRecurrenceRule', );
    },
    resetEventAttendeeForm() {},
    createEventAttendeeBody() {
      let eventAttendeeBody = {
        startDateTime: this.eventAttendeeFormData.startDateTime,
        endDateTime: this.eventAttendeeFormData.endDateTime,

        scheduleID: this.eventAttendeeFormData.scheduleID,
        eventID: this.event._id,

        modifiedDateTime: this.event.modifiedDateTime
      };

      if (this.eventAttendeeFormData.end == 'Until Date') {
        eventAttendeeBody.recurrenceRule = { untilDateTime: this.eventAttendeeFormData.untilDateTime };
      }
      if (this.eventAttendeeFormData.end == 'Occurrences') {
        eventAttendeeBody.recurrenceRule = { occurrences: this.eventAttendeeFormData.occurrences };
      }
      return eventAttendeeBody;
    },
    createEventAttendee() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = this.createEventAttendeeBody();

      fetch('/api/v1/event-attendees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    configureEventAttendeeForm(eventAttendee) {
      this.eventAttendeeFormData._id = eventAttendee._id;

      this.eventAttendeeFormData.startDateTime = dayjs(eventAttendee.startDateTime);
      this.eventAttendeeFormData.endDateTime = dayjs(eventAttendee.endDateTime);

      this.eventAttendeeFormData.scheduleID = eventAttendee.scheduleID;
      this.eventAttendeeFormData.isInstance = eventAttendee.isInstance;

      if (this.eventAttendee.untilDateTime) {
        this.eventAttendeeFormData.end = 'Until Date';
        this.eventAttendeeFormData.untilDateTime = dayjs(this.eventAttendee.recurrenceRule.untilDateTime);
      } else if (this.eventAttendee.occurrences) {
        this.eventAttendeeFormData.end = 'Occurrences';
        this.eventAttendeeFormData.occurrences = this.eventAttendee.recurrenceRule.occurrences;
      }
    },
    updateDecision() {
      if (this.eventAttendeeFormData.isInstance && this.eventAttendeeFormData.isInstance === true) {
        this.eventAttendeeUpdatePopoverVisible = true;
      } else {
        this.updateEventAttendee();
      }
    },
    updateEventAttendee() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = this.createEventAttendeeBody();

      fetch('/api/v1/event-attendees/' + this.eventAttendeeFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 200) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    updateThisEventAttendee() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = this.createEventAttendeeBody();

      fetch('/api/v1/event-attendees/thisEventAttendee/' + this.eventAttendeeFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 201) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    updateThisAndFollowingEventAttendees() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = this.createEventAttendeeBody();

      fetch('/api/v1/event-attendees/thisAndFollowingEventAttendees/' + this.eventAttendeeFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 201) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    updateAllEventAttendees() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = this.createEventAttendeeBody();

      fetch('/api/v1/event-attendees/allEventAttendees/' + this.eventAttendeeFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 200) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    deleteDecision() {
      if (this.eventAttendeeFormData.isInstance && this.eventAttendeeFormData.isInstance === true) {
        this.eventAttendeeDeletePopoverVisible = true;
      } else {
        this.deleteEventAttendee();
      }
    },
    deleteEventAttendee() {
      this.eventAttendeeLoading = true;
      fetch('/api/v1/event-attendees/' + this.eventAttendeeFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.resetEventAttendeeForm();
        } else {
          response.json().then((data) => {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          });
        }
      });
    },
    deleteThisEventAttendee() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = { scheduleID: this.eventAttendeeFormData.scheduleID, startDateTime: this.eventAttendeeFormData.startDateTime };

      fetch('/api/v1/event-attendees/thisEventAttendee/' + this.eventAttendeeFormData._id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 201) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    deleteThisAndFollowingEventAttendees() {
      this.eventAttendeeLoading = true;
      let eventAttendeeBody = {
        startDateTime: this.eventAttendeeFormData.startDateTime,
        untilDateTime: dayjs(this.eventAttendeeFormData.untilDateTime)
      };

      fetch('/api/v1/event-attendees/thisAndFollowingEventAttendees/' + this.eventAttendeeFormData._id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventAttendeeBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventAttendeeLoading = false;
          if (response.status === 200) {
            this.resetEventAttendeeForm();
          } else {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          }
        });
      });
    },
    deleteAllEventAttendees() {
      this.eventAttendeeLoading = true;
      fetch('/api/v1/event-attendees/allEventAttendees/' + this.eventAttendeeFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.resetEventAttendeeForm();
        } else {
          response.json().then((data) => {
            this.eventAttendeeFormErrorMessage = data.message;
            this.eventAttendeeLoading = false;
          });
        }
      });
    }
  }
};
</script>
