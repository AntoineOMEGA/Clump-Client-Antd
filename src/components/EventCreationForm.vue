<template>
  <a-drawer v-model:open="eventEditOverlayVisible" @close="resetForm()">
    <a-card>
      <a-form>
        <a-select :items="schedules.sort((a, b) => (a.title > b.title ? 1 : -1))" item-title="title" item-value="_id" v-model="eventFormData.scheduleID" label="Schedules" clearable></a-select>
        <a-select v-model="eventFormData.eventTemplateID" :item-props="true" :items="eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))" item-title="_id" item-value="_id" addonBefore="Event Template" clearable>
          <template a-slot:item="{ props, item }">
            <a-list-item a-bind="props" :subtitle="item.raw.description"></a-list-item>
          </template>
        </a-select>

        <a-input addonBefore="Title" v-model="eventFormData.title" v-if="!eventFormData.eventTemplateID"></a-input>
        <a-input addonBefore="Location" v-model="eventFormData.location" v-if="!eventFormData.eventTemplateID"></a-input>
        <a-textarea addonBefore="Description" v-model="eventFormData.description" v-if="!eventFormData.eventTemplateID"></a-textarea>

        <a-select v-model="eventFormData.timeZone" :items="timeZones" addonBefore="Time Zone" clearable v-if="!eventFormData.eventTemplateID"></a-select>

        <a-select v-model="eventFormData.shiftID" addonBefore="Shift" clearable v-if="eventFormData.eventTemplateID"></a-select>

        <div class="d-flex justify-space-between">
          <a-input label="Start Date" type="date" v-model="eventFormData.startDate"></a-input>
        </div>

        <div class="d-flex justify-space-between">
          <a-input addonBefore="End Date" type="date" v-model="eventFormData.endDate"></a-input>
        </div>

        <a-select addonBefore="Frequency" v-model="eventFormData.recurrence.frequency" :items="recurrenceRuleOptions.freq"></a-select>
      </a-form>
      <div v-if="eventFormData.recurrence.frequency != 'Once'">
        <span>Advanced Frequency</span>
      </div>
      <a-card a-show="eventEditAdvanced">
        <a-form>
          <a-input v-if="['Daily', 'Weekly', 'Monthly by Day'].includes(eventFormData.recurrence.frequency)" addonBefore="Interval" type="number" v-model="eventFormData.recurrence.interval" clearable></a-input>

          <a-select v-if="['Yearly by Day', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)" addonBefore="Month" v-model="eventFormData.recurrence.ByMonth" :items="Object.keys(recurrenceRuleOptions.advFreq.ByMonth)" clearable></a-select>

          <a-select v-if="['Monthly by Day', 'Yearly by Day'].includes(eventFormData.recurrence.frequency)" addonBefore="Occurrences of Week Days in Month" v-model="eventFormData.recurrence.ByDayMonthly" :items="Object.keys(generatedMonthDays)" multiple clearable></a-select>

          <a-select v-if="['Weekly'].includes(eventFormData.recurrence.frequency)" addonBefore="Days of Week" v-model="eventFormData.recurrence.byDay" :items="Object.keys(recurrenceRuleOptions.advFreq.ByDay)" multiple clearable></a-select>

          <a-select v-if="['Monthly by Date', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)" addonBefore="Day in Month" v-model="eventFormData.recurrence.ByMonthDay" :items="Object.keys(recurrenceRuleOptions.advFreq.ByMonthDay)" multiple clearable></a-select>

          <a-input v-if="eventFormData.recurrence.frequency != 'Once'" addonBefore="Until" type="date" v-model="eventFormData.until" clearable></a-input>
          <a-input v-if="eventFormData.recurrence.frequency != 'Once'" addonBefore="Until" type="date" v-model="eventFormData.until" clearable></a-input>
        </a-form>
      </a-card>
    </a-card>

    <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2" v-if="eventFormErrorMessage != ''" />

    <a-flex justify="space-around" align="middle" gap="middle">
      <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateEvent()">Save</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block danger @click="deleteEvent()">Delete</a-button>
    </a-flex>
  </a-drawer>
</template>

<script setup></script>

<script>
export default {
  mounted() {
    this.formSiteSchedule();
    let initialStartDate = new Date();
    let initialEndDate = new Date();
    initialEndDate.setDate(initialEndDate.getDate() + 7);
    this.getCombineScheduleData(initialStartDate, initialEndDate);
    this.startDate = initialStartDate.toISOString().substring(0, 10);
    this.endDate = initialEndDate.toISOString().substring(0, 10);
  },
  data() {
    return {
      schedules: [],
      eventTemplates: [],
      eventEditOverlayVisible: false,
      eventEditAdvanced: false,
      eventFormData: {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        recurrence: {
          frequency: 'Once',
          interval: 0,
          count: 0,
          byDay: [],
          byDayMonthly: [],
          byMonth: 0,
          byMonthDay: [0]
        },
        until: '',
        scheduleID: '',
        eventTemplateID: '',
        shiftID: ''
      },
      eventFormErrorMessage: '',
      getSchedulesErrorMessage: '',
      timeZones: new Intl.Locale('en-US').timeZones,
      recurrenceRuleOptions: {
        freq: ['Once', 'Daily', 'Weekly', 'Monthly by Day', 'Monthly by Date', 'Yearly by Day', 'Yearly by Date'],
        advFreq: {
          ByDay: {
            Monday: 'MO',
            Tuesday: 'TU',
            Wednesday: 'WE',
            Thursday: 'TH',
            Friday: 'FR',
            Saturday: 'SA',
            Sunday: 'SU'
          },
          ByDayExtended: { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, Last: -1 },
          ByMonthDay: {
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
          ByMonth: {
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
          }
        }
      }
    };
  },
  computed: {
    generatedMonthDays() {
      let monthDays = {};
      for (let dayExtended of Object.keys(this.recurrenceRuleOptions.advFreq.ByDayExtended)) {
        for (let day of Object.keys(this.recurrenceRuleOptions.advFreq.ByDay)) {
          monthDays[dayExtended + ' ' + day] = this.recurrenceRuleOptions.advFreq.ByDayExtended[dayExtended] + this.recurrenceRuleOptions.advFreq.ByDay[day];
        }
      }
      return monthDays;
    }
  },
  methods: {
    resetForm() {
      this.eventEditOverlayVisible = false;
      this.eventEditAdvanced = false;
      this.eventFormData = {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        recurrence: {
          frequency: 'Once',
          interval: 0,
          count: 0,
          byDay: [],
          byDayMonthly: [],
          byMonth: 0,
          byMonthDay: [0]
        },
        until: '',
        scheduleID: '',
        eventTemplateID: ''
      };
      this.eventFormErrorMessage = '';
    },
    createEvent() {
      if (this.eventFormData.eventTemplateID != '') {
        this.eventFormData.title = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].title;
        this.eventFormData.description = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].description;
        this.eventFormData.location = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].location;
      }

      let eventBody = {
        title: this.eventFormData.title,
        description: this.eventFormData.description,
        location: this.eventFormData.location,
        startDateTime: new Date(this.eventFormData.startDate + 'T' + this.convertToMilitaryTime(this.eventFormData.startTime) + ':00'),
        endDateTime: new Date(this.eventFormData.endDate + 'T' + this.convertToMilitaryTime(this.eventFormData.endTime) + ':00'),

        shiftID: this.eventFormData.shiftID,

        scheduleID: this.eventFormData.scheduleID,
        eventTemplateID: this.eventFormData.eventTemplateID
      };

      if (this.eventFormData.recurrence.frequency == 'Once') {
        eventBody.recurrence = {
          frequency: 'Once'
        };
      } else {
        eventBody.recurrence = {};

        eventBody.recurrence.interval = this.eventFormData.recurrence.interval;

        if (this.eventFormData.until != '') {
          eventBody.until = new Date(this.eventFormData.until);
        }

        if (this.eventFormData.recurrence.frequency == 'Daily') {
          eventBody.recurrence.frequency = 'Daily';
        } else if (this.eventFormData.recurrence.frequency == 'Weekly') {
          eventBody.recurrence.frequency = 'Weekly';
          eventBody.recurrence.byDay = this.eventFormData.recurrence.byDay;
        } else if (this.eventFormData.recurrence.frequency == 'Monthly by Day') {
          eventBody.recurrence.frequency = 'Monthly by Day';
          eventBody.recurrence.byDayMonthly = this.eventFormData.recurrence.byDayMonthly;
        } else if (this.eventFormData.recurrence.frequency == 'Monthly by Date') {
          eventBody.recurrence.frequency = 'Monthly by Date';
          eventBody.recurrence.byMonthDay = this.eventFormData.recurrence.byMonthDay;
        } else if (this.eventFormData.recurrence.frequency == 'Yearly by Day') {
          eventBody.recurrence.frequency = 'Yearly by Day';
          eventBody.recurrence.byDayMonthly = this.eventFormData.recurrence.byDayMonthly;
          eventBody.recurrence.byMonth = this.eventFormData.recurrence.byMonth;
        } else if (this.eventFormData.recurrence.frequency == 'Yearly by Date') {
          eventBody.recurrence.frequency = 'Yearly by Date';
          eventBody.recurrence.byMonthDay = this.eventFormData.recurrence.byMonthDay;
          eventBody.recurrence.byMonth = this.eventFormData.recurrence.byMonth;
        }
      }

      fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.resetForm();
          } else {
            this.eventFormErrorMessage = data.message;
          }
        });
      });
    },
    configureEventForm(event) {
      this.eventFormData._id = event._id;
      this.eventFormData.title = event.title;
      this.eventFormData.description = event.description;
      this.eventFormData.location = event.location;

      this.eventFormData.startDate = new Date(event.startDateTime).toISOString().substring(0, 10);
      this.eventFormData.endDate = new Date(event.endDateTime).toISOString().substring(0, 10);
      this.eventFormData.startTime = this.convertToLocalTime(new Date(event.startDateTime).toLocaleTimeString('it-IT').substring(0, 5));
      this.eventFormData.endTime = this.convertToLocalTime(new Date(event.endDateTime).toLocaleTimeString('it-IT').substring(0, 5));

      this.eventFormData.recurrence = event.recurrence;

      this.eventFormData.scheduleID = event.scheduleID;
      this.eventFormData.eventTemplateID = event.eventTemplateID;
      this.eventFormData.shiftID = event.shiftID;

      this.eventEditOverlayVisible = true;
      this.eventEditAdvanced = false;
    },
    updateEvent() {
      if (this.eventFormData.eventTemplateID != '') {
        this.eventFormData.title = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].title;
        this.eventFormData.description = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].description;
        this.eventFormData.location = this.objectifiedEventTemplates[this.eventFormData.eventTemplateID].location;
      }

      let eventBody = {
        title: this.eventFormData.title,
        description: this.eventFormData.description,
        location: this.eventFormData.location,
        startDateTime: this.eventFormData.startDate + 'T' + this.convertToMilitaryTime(this.eventFormData.startTime) + ':00',
        endDateTime: this.eventFormData.endDate + 'T' + this.convertToMilitaryTime(this.eventFormData.endTime) + ':00',

        shiftID: this.eventFormData.shiftID,

        scheduleID: this.eventFormData.scheduleID,
        eventTemplateID: this.eventFormData.eventTemplateID
      };

      if (this.eventFormData.recurrence.frequency == 'Once') {
        eventBody.recurrence = {
          frequency: 'Once'
        };
      } else {
        eventBody.recurrence = {};

        eventBody.recurrence.interval = this.eventFormData.recurrence.interval;

        if (this.eventFormData.until != '') {
          eventBody.until = new Date(this.eventFormData.until);
        }

        if (this.eventFormData.recurrence.frequency == 'Daily') {
          eventBody.recurrence.frequency = 'Daily';
        } else if (this.eventFormData.recurrence.frequency == 'Weekly') {
          eventBody.recurrence.frequency = 'Weekly';
          eventBody.recurrence.byDay = this.eventFormData.recurrence.byDay;
        } else if (this.eventFormData.recurrence.frequency == 'Monthly by Day') {
          eventBody.recurrence.frequency = 'Monthly by Day';
          eventBody.recurrence.byDayMonthly = this.eventFormData.recurrence.byDayMonthly;
        } else if (this.eventFormData.recurrence.frequency == 'Monthly by Date') {
          eventBody.recurrence.frequency = 'Monthly by Date';
          eventBody.recurrence.byMonthDay = this.eventFormData.recurrence.byMonthDay;
        } else if (this.eventFormData.recurrence.frequency == 'Yearly by Day') {
          eventBody.recurrence.frequency = 'Yearly by Day';
          eventBody.recurrence.byDayMonthly = this.eventFormData.recurrence.byDayMonthly;
          eventBody.recurrence.byMonth = this.eventFormData.recurrence.byMonth;
        } else if (this.eventFormData.recurrence.frequency == 'Yearly by Date') {
          eventBody.recurrence.frequency = 'Yearly by Date';
          eventBody.recurrence.byMonthDay = this.eventFormData.recurrence.byMonthDay;
          eventBody.recurrence.byMonth = this.eventFormData.recurrence.byMonth;
        }
      }

      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            console.log(data.data);
          } else {
            this.eventFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteEvent() {
      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            console.log(response.status);
          } else {
            this.eventFormErrorMessage = data.message;
          }
        });
      });
    }
  }
};
</script>
