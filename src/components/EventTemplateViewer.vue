<template>
  <a-float-button type="primary" style="height: 60px; width: 60px"
    @click="eventEditOverlayVisible = !eventEditOverlayVisible">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px">
    <a-input size="large" addonBefore="Search" v-model:value="filterSettings.search"></a-input>
  </div>

  <div>
    <a-flex justify="space-around" align="middle" gap="middle">
      <a-date-picker placeholder="Start Date" v-model="startDate"></a-date-picker>
      <a-date-picker placeholder="End Date" v-model="endDate"></a-date-picker>
    </a-flex>
    <a-button @click="getCombineScheduleData(startDate, endDate)" size="large">Load Selected Dates</a-button>
  </div>

  <a-alert message="Error" :description="getSchedulesErrorMessage" type="error" class="mb-2"
    v-if="getSchedulesErrorMessage != ''" />

  <div
    v-for="site in Object.keys(combinedSchedules).sort((a, b) => (objectifiedEventTemplates[a].title > objectifiedEventTemplates[b].title) ? 1 : -1)"
    :key="site">
    <a-card
      v-if="Object.keys(combinedSchedules[site]).length > 0 && objectifiedEventTemplates[site].title.toLowerCase().includes(filterSettings.search.toLowerCase())"
      :title="objectifiedEventTemplates[site].title">


      <div a-show="show[site]">
        <a-divider></a-divider>

        <a-card
          v-for="date in Object.keys(combinedSchedules[site]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime()) ? 1 : -1)"
          :key="date" :title="new Date(date).toDateString()">
          <div
            v-for="time in Object.keys(combinedSchedules[site][date]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime()) ? 1 : -1)"
            :key="time">
            <div>
              <div>
                <span>{{ time }}</span>
                <span style="float: right">{{ combinedSchedules[site][date][time].length }}</span>
              </div>
            </div>
            <div>
              <a-tag v-for="schedule in Object.keys(combinedSchedules[site][date][time])" :key="schedule"
                :color="objectifiedScheduleCategories[objectifiedSchedules[schedule].scheduleCategoryID].color"
                @click="configureEventForm(objectifiedEvents[combinedSchedules[site][date][time][schedule].eventID])">
                {{ objectifiedSchedules[schedule].title }}
              </a-tag>
            </div>
          </div>
        </a-card>
      </div>

    </a-card>
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
</script>

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
          byMonthDay: [0],
        },
        until: '',
        scheduleID: '',
        eventTemplateID: '',
        shiftID: '',
      },
      eventFormErrorMessage: '',
      show: [],
      objectifiedSchedules: {},
      objectifiedScheduleCategories: {},
      objectifiedEvents: {},
      objectifiedEventTemplates: {},
      startDate: undefined,
      endDate: undefined,
      combinedSchedules: {},
      getSchedulesErrorMessage: '',
      filterSettings: {
        search: ''
      },
      timeZones: new Intl.Locale('en-US').timeZones,
      recurrenceRuleOptions: {
        freq: ['Once', 'Daily', 'Weekly', 'Monthly by Day', 'Monthly by Date', 'Yearly by Day', 'Yearly by Date'],
        advFreq: {
          'ByDay': { 'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA', 'Sunday': 'SU' },
          'ByDayExtended': { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, 'Last': -1 },
          'ByMonthDay': { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '6th': 6, '7th': 7, '8th': 8, '9th': 9, '10th': 10, '11th': 11, '12th': 12, '13th': 13, '14th': 14, '15th': 15, '16th': 16, '17th': 17, '18th': 18, '19th': 19, '20th': 20, '21st': 21, '22nd': 22, '23rd': 23, '24th': 24, '25th': 25, '26th': 26, '27th': 27, '28th': 28, '29th': 29, '30th': 30, '31st': 31 },
          'ByMonth': { 'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12 },
        }
      }
    }
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
          byMonthDay: [0],
        },
        until: '',
        scheduleID: '',
        eventTemplateID: '',
      }
      this.eventFormErrorMessage = '';
    },
    convertArrayToObject(array, object) {
      let newArray = array;
      newArray.forEach(element => {
        object[element._id] = element;
        //delete object[element._id]._id;
      });
    },
    formSiteSchedule() {
      for (let eventTemplate of Object.keys(this.objectifiedEventTemplates)) {
        this.combinedSchedules[eventTemplate] = {};
      }

      for (let event of Object.keys(this.objectifiedEvents)) {
        let eventStartDate = new Date(this.objectifiedEvents[event].startDateTime).toLocaleString('en-US').split(',')[0];
        let eventStartTime = new Date(this.objectifiedEvents[event].startDateTime).toLocaleTimeString('en-US');
        eventStartTime = eventStartTime.replace(':00 ', ' ');
        let eventEndTime = new Date(this.objectifiedEvents[event].endDateTime).toLocaleTimeString('en-US');
        eventEndTime = eventEndTime.replace(':00 ', ' ');

        if ("eventTemplateID" in this.objectifiedEvents[event]) {
          if (eventStartDate in this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID] == false) {
            this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate] = {};
          }

          let timeSlot = eventStartTime + ' - ' + eventEndTime;

          if (timeSlot in this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate] == false) {
            this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate][timeSlot] = {};
          }

          if (this.objectifiedEvents[event].scheduleID in this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate][timeSlot] == false) {
            this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate][timeSlot][this.objectifiedEvents[event].scheduleID] = {};
            this.combinedSchedules[this.objectifiedEvents[event].eventTemplateID][eventStartDate][timeSlot][this.objectifiedEvents[event].scheduleID]['eventID'] = event;
          }
        }
      }
    },
    getCombineScheduleData(startDate, endDate) {
      this.getSchedulesErrorMessage = '';
      fetch('/api/v1/schedules/combine-schedules?startDate=' + startDate + '&endDate=' + endDate, {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.objectifiedEvents = {};
            this.convertArrayToObject(data.data.events, this.objectifiedEvents);

            this.objectifiedEventTemplates = {};
            this.eventTemplates = data.data.eventTemplates;
            this.convertArrayToObject(data.data.eventTemplates, this.objectifiedEventTemplates);

            this.objectifiedShifts = {};
            this.shifts = data.data.shifts;
            this.convertArrayToObject(data.data.shifts, this.objectifiedShifts);

            this.objectifiedSchedules = {};
            this.schedules = data.data.schedules;
            this.convertArrayToObject(data.data.schedules, this.objectifiedSchedules);

            this.objectifiedScheduleCategories = {};
            this.convertArrayToObject(data.data.scheduleCategories, this.objectifiedScheduleCategories);

            this.formSiteSchedule();
          } else {
            this.getSchedulesErrorMessage = data.message;
          }
        })
      })
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
        eventTemplateID: this.eventFormData.eventTemplateID,
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.resetForm();
          } else {
            this.eventFormErrorMessage = data.message;
          }
        })
      })
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
        eventTemplateID: this.eventFormData.eventTemplateID,
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
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            console.log(data.data);
          } else {
            this.eventFormErrorMessage = data.message;
          }
        })
      })
    },
    deleteEvent() {
      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'DELETE',
      }).then(response => {
        response.json().then(data => {
          if (response.status === 204) {
            console.log(response.status)
          } else {
            this.eventFormErrorMessage = data.message;
          }
        })
      })
    }
  }
}
</script>