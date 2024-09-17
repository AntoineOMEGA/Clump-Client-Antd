<template>
  <a-modal :open="visible" @cancel="close()" title="Event Editor">
    <template #footer></template>
    <a-spin :spinning="eventLoading">
      <a-form>
        <div class="mb-2" v-if="!eventFormData._id">
          Event Template
          <a-select v-on:change="applyEventTemplate(eventFormData.eventTemplateID)"
            v-model:value="eventFormData.eventTemplateID" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))"
              :value="eventTemplate._id" :key="eventTemplate._id">{{ eventTemplate.title }}</a-select-option>
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
              <a-time-picker size="large" v-model:value="eventFormData.startTime" format="h:mm A" :minute-step="5"
                allowClear></a-time-picker>
            </div>
            <div>
              End Time
              <a-time-picker size="large" v-model:value="eventFormData.endTime" format="h:mm A" :minute-step="5"
                allowClear></a-time-picker>
            </div>
          </a-flex>
        </div>

        <div class="mb-2">
          <a-flex justify="space-around" align="middle" gap="middle">
            <div>
              Start Date
              <a-date-picker size="large" v-model:value="eventFormData.startDate" format="MM-DD-YYYY"
                allowClear></a-date-picker>
            </div>
            <div>
              End Date
              <a-date-picker size="large" v-model:value="eventFormData.endDate" format="MM-DD-YYYY"
                allowClear></a-date-picker>
            </div>
          </a-flex>
        </div>

        <a-collapse ghost>
          <a-collapse-panel key="recurrence" header="Repeat Event">
            <div class="mb-2">
              Frequency
              <a-select v-model:value="recurrenceRuleFormData.frequency" size="large" style="width: 100%" allowClear>
                <a-select-option v-for="option in recurrenceRuleOptions.frequency" :value="option" :key="option">
                  {{ option }}
                </a-select-option>
              </a-select>
            </div>

            <div class="mb-2"
              v-if="['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)">
              Interval
              <a-input type="number" v-model:value="recurrenceRuleFormData.interval" allowClear></a-input>
            </div>

            <div v-if="['Yearly by day', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
              Month
              <a-select v-model:value="recurrenceRuleFormData.byMonth" size="large" style="width: 100%" allowClear>
                <a-select-option v-for="month in Object.keys(recurrenceRuleOptions.byMonth)"
                  :value="recurrenceRuleOptions.byMonth[month]" :key="month">
                  {{ month }}
                </a-select-option>
              </a-select>
            </div>

            <div v-if="['Monthly by day', 'Yearly by day'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
              Occurrences of Week Days in Month
              <a-select v-model:value="recurrenceRuleFormData.byWeekDayInMonth" size="large" style="width: 100%"
                allowClear mode="multiple">
                <a-select-option v-for="monthDay in Object.keys(generatedMonthDays)"
                  :value="generatedMonthDays[monthDay]" :key="monthDay">
                  {{ monthDay }}
                </a-select-option>
              </a-select>
            </div>

            <div v-if="['Weekly'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
              Days of Week
              <a-select v-model:value="recurrenceRuleFormData.byDay" size="large" style="width: 100%" allowClear
                mode="multiple">
                <a-select-option v-for="weekDay in Object.keys(recurrenceRuleOptions.byDay)"
                  :value="recurrenceRuleOptions.byDay[weekDay]" :key="weekDay">
                  {{ weekDay }}
                </a-select-option>
              </a-select>
            </div>

            <div v-if="['Monthly by date', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)" class="mb-2">
              Day in Month
              <a-select v-model:value="recurrenceRuleFormData.byMonthDay" size="large" style="width: 100%" allowClear
                mode="multiple">
                <a-select-option v-for="dayInMonth in Object.keys(recurrenceRuleOptions.byMonthDay)"
                  :value="recurrenceRuleOptions.byMonthDay[dayInMonth]" :key="dayInMonth">
                  {{ dayInMonth }}
                </a-select-option>
              </a-select>
            </div>

            <div class="mb-2"
              v-if="['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'].includes(recurrenceRuleFormData.frequency)">
              End
              <a-radio-group v-model:value="recurrenceRuleFormData.end" option-type="button"
                :options="recurrenceRuleOptions.endOptions" style="display: block" />
            </div>

            <div v-if="recurrenceRuleFormData.end == 'Occurrences'" class="mb-2">
              Occurrences
              <a-input type="number" v-model:value="recurrenceRuleFormData.occurrences" allowClear></a-input>
            </div>

            <div v-if="recurrenceRuleFormData.end == 'Until Date'" class="mb-2">
              Until Date
              <a-date-picker size="large" v-model:value="recurrenceRuleFormData.untilDateTime" format="MM-DD-YYYY"
                style="width: 100%" allowClear></a-date-picker>
            </div>

            <a-alert
              message="Recurrence Rules only effect when the Event Repeats. They do not effect which Date the Event Starts."
              type="warning" />
          </a-collapse-panel>
          <a-collapse-panel key="attendees" header="Attendees">
            <div class="mb-2">
              Max Attendees
              <a-input size="large" type="number" v-model:value="eventFormData.maxAttendees" allowClear></a-input>
            </div>

            <div class="mb-2">
              Attendees
              <a-button type="primary" style="margin: 10px" @click="console.log('Child Event')">Add Attendees</a-button>
            </div>

            <!-- <div v-if="eventFormData._id" class="mb-2">
              Attendees
              <a-select v-model:value="attendees" size="large" style="width: 100%" allowClear mode="multiple">
                <a-select-option v-for="schedule in schedules.sort()" :value="schedule._id" :key="schedule._id">
                  {{ schedule.title }}
                </a-select-option>
              </a-select>
            </div> -->
          </a-collapse-panel>
        </a-collapse>
      </a-form>

      <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2"
        v-if="eventFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle" class="mb-2">
        <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateDecision()">Save</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block danger
          @click="deleteDecision()">Delete</a-button>
      </a-flex>

      <a-popover v-model:open="eventUpdatePopoverVisible" title="Update Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="updateThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="updateThisAndFollowingEvents()">This and Following
            Events</a-button>
          <a-button type="primary" style="margin: 10px" @Click="updateAllEvents()">All Events</a-button>
        </template>
      </a-popover>

      <a-popover v-model:open="eventDeletePopoverVisible" title="Delete Instances" trigger="click">
        <template #content>
          <a-button type="primary" style="margin: 10px" @click="deleteThisEvent()">This Event</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteThisAndFollowingEvents()">This and Following
            Events</a-button>
          <a-button type="primary" style="margin: 10px" @click="deleteAllEvents()">All Events</a-button>
        </template>
      </a-popover>
    </a-spin>
  </a-modal>
</template>

<script setup>
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() { },
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
        eventTemplateID: '',
        maxAttendees: 0
      },
      timeZones: new Intl.Locale('en-US').timeZones,
      eventTemplates: [],
      recurrenceRuleOptions: {
        frequency: ['Daily', 'Weekly', 'Monthly by day', 'Monthly by date', 'Yearly by day', 'Yearly by date'],
        byDay: {
          Monday: 'MO',
          Tuesday: 'TU',
          Wednesday: 'WE',
          Thursday: 'TH',
          Friday: 'FR',
          Saturday: 'SA',
          Sunday: 'SU'
        },
        byWeekInMonth: { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, Last: -1 },
        byMonthDay: {
          '1st': 1,
          '2nd': 2,
          '3rd': 3,
          '4th': 4,
          '5th': 5,
          '6th': 6,
          '7th': 7,
          '8th': 8,
          '9th': 9,
          '10th': 10,
          '11th': 11,
          '12th': 12,
          '13th': 13,
          '14th': 14,
          '15th': 15,
          '16th': 16,
          '17th': 17,
          '18th': 18,
          '19th': 19,
          '20th': 20,
          '21st': 21,
          '22nd': 22,
          '23rd': 23,
          '24th': 24,
          '25th': 25,
          '26th': 26,
          '27th': 27,
          '28th': 28,
          '29th': 29,
          '30th': 30,
          '31st': 31
        },
        byMonth: {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12
        },
        endOptions: ['Not Set', 'Until Date', 'Occurrences']
      },
      recurrenceRuleFormData: {}
    };
  },
  computed: {
    generatedMonthDays() {
      let monthDays = {};
      for (let dayExtended of Object.keys(this.recurrenceRuleOptions.byWeekInMonth)) {
        for (let day of Object.keys(this.recurrenceRuleOptions.byDay)) {
          monthDays[(dayExtended + ' ' + day).toString()] = this.recurrenceRuleOptions.byWeekInMonth[dayExtended] + this.recurrenceRuleOptions.byDay[day];
        }
      }
      return monthDays;
    }
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
        scheduleID: this.scheduleID,
        maxAttendees: this.maxAttendees
      };

      this.eventFormErrorMessage = '';
      this.eventLoading = false;
      this.$emit('close');
    },
    close() {
      this.resetEventForm();
    },
    createEventBody() {
      let eventBody = {};

      let newRecurrenceRule = {
        frequency: this.recurrenceRuleFormData.frequency
      };

      if (this.recurrenceRuleFormData.frequency == 'Weekly') {
        newRecurrenceRule.byDay = this.recurrenceRuleFormData.byDay;
      }

      if (this.recurrenceRuleFormData.frequency == 'Monthly by day') {
        newRecurrenceRule.byWeekDayInMonth = this.recurrenceRuleFormData.byWeekDayInMonth;
      }

      if (this.recurrenceRuleFormData.frequency == 'Monthly by date') {
        newRecurrenceRule.byMonthDay = this.recurrenceRuleFormData.byMonthDay;
      }

      if (this.recurrenceRuleFormData.frequency == 'Yearly by day') {
        newRecurrenceRule.byWeekDayInMonth = this.recurrenceRuleFormData.byWeekDayInMonth;
        newRecurrenceRule.byMonth = this.recurrenceRuleFormData.byMonth;
      }

      if (this.recurrenceRuleFormData.frequency == 'Yearly by date') {
        newRecurrenceRule.byMonthDay = this.recurrenceRuleFormData.byMonthDay;
        newRecurrenceRule.byMonth = this.recurrenceRuleFormData.byMonth;
      }

      if (this.recurrenceRuleFormData.interval > 1) {
        newRecurrenceRule.interval = this.recurrenceRuleFormData.interval;
      }

      if (this.recurrenceRuleFormData.end == 'Until Date') {
        newRecurrenceRule.untilDateTime = this.recurrenceRuleFormData.untilDateTime;
      } else if (this.recurrenceRuleFormData.end == 'Occurrences') {
        newRecurrenceRule.occurrences = this.recurrenceRuleFormData.occurrences;
      }

      eventBody = {
        title: this.eventFormData.title,
        description: this.eventFormData.description,
        location: this.eventFormData.location,
        startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()),
        endDateTime: this.eventFormData.endDate.hour(dayjs(this.eventFormData.endTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.endTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.endTime, 'HH:mm:ss').second()),
        timeZone: this.eventFormData.timeZone,

        scheduleID: this.scheduleID,
        //scheduleID: this.eventFormData.scheduleID,
        recurrenceRule: newRecurrenceRule,

        maxAttendees: this.eventFormData.maxAttendees
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
      this.eventFormData.timeZone = event.timeZone;

      this.eventFormData.scheduleID = event.scheduleID;
      this.eventFormData.isInstance = event.isInstance;

      this.eventFormData.maxAttendees = event.maxAttendees;

      this.recurrenceRuleFormData.frequency = this.event.recurrenceRule.frequency;

      if (this.recurrenceRuleFormData.frequency == 'Weekly') {
        this.recurrenceRuleFormData.byDay = this.event.recurrenceRule.byDay;
      }

      if (this.recurrenceRuleFormData.frequency == 'Monthly by day') {
        this.recurrenceRuleFormData.byWeekDayInMonth = this.event.recurrenceRule.byWeekDayInMonth;
      }

      if (this.recurrenceRuleFormData.frequency == 'Monthly by date') {
        this.recurrenceRuleFormData.byMonthDay = this.event.recurrenceRule.byMonthDay;
      }

      if (this.recurrenceRuleFormData.frequency == 'Yearly by day') {
        this.recurrenceRuleFormData.byWeekDayInMonth = this.event.recurrenceRule.byWeekDayInMonth;
        this.recurrenceRuleFormData.byMonth = this.event.recurrenceRule.byMonth;
      }

      if (this.recurrenceRuleFormData.frequency == 'Yearly by date') {
        this.recurrenceRuleFormData.byMonthDay = this.event.recurrenceRule.byMonthDay;
        this.recurrenceRuleFormData.byMonth = this.event.recurrenceRule.byMonth;
      }

      this.recurrenceRuleFormData.interval = this.event.recurrenceRule.interval;

      if (this.event.recurrenceRule.untilDateTime) {
        this.recurrenceRuleFormData.end = 'Until Date';
        this.recurrenceRuleFormData.untilDateTime = dayjs(this.event.recurrenceRule.untilDateTime);
      } else if (this.event.recurrenceRule.occurrences) {
        this.recurrenceRuleFormData.end = 'Occurrences';
        this.recurrenceRuleFormData.occurrences = this.event.recurrenceRule.occurrences;
      }
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
    }
  }
};
</script>
