<template>
  <a-button color="white" icon rounded="pill" density="compact"
    @click="eventEditOverlayVisible = !eventEditOverlayVisible"
    style="position: fixed; bottom: 150px; right: 10px; z-index: 100; height: 60px; width: 60px;">
    <a-icon color="pink" style="font-size: 3.5rem">mdi-plus-circle</a-icon>
  </a-button>

  <a-card class="mb-5">
    <a-card-actions>
      <a-input hide-details="auto" label="Search Event Templates" a-model="filterSettings.search"></a-input>
    </a-card-actions>
  </a-card>

  <a-card class="mb-4 bg-grey-darken-3">
    <a-card-item class="pa-4 ma-0">
      <div class="d-flex justify-space-between mb-0">
        <a-input class="ma-0 mr-4" label="Start Date" a-model="startDate" type="date"></a-input>
        <a-input class="ma-0" label="End Date" a-model="endDate" type="date"></a-input>
      </div>

      <a-button @click="getCombineScheduleData(startDate, endDate)" size="x-large" class="bg-pink bebas-neue-regular"
        rounded="pill">Load Selected Dates</a-button>
    </a-card-item>
  </a-card>

  <a-card class="bg-red-accent-3 mb-5" a-if="getSchedulesErrorMessage != ''">
    <a-card-title>{{ getSchedulesErrorMessage }}</a-card-title>
  </a-card>

  <div
    a-for="site in Object.keys(combinedSchedules).sort((a, b) => (objectifiedEventTemplates[a].title > objectifiedEventTemplates[b].title) ? 1 : -1)"
    :key="site">
    <a-card
      a-if="Object.keys(combinedSchedules[site]).length > 0 && objectifiedEventTemplates[site].title.toLowerCase().includes(filterSettings.search.toLowerCase())"
      class="mb-4">
      <a-card-title class="bebas-neue-regular">{{ objectifiedEventTemplates[site].title }}</a-card-title>
      <a-card-actions>
        <a-spacer></a-spacer>
        <a-button :icon="show[site] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="show[site] = !show[site]"></a-button>
      </a-card-actions>


      <a-expand-transition>
        <div a-show="show[site]">
          <a-divider></a-divider>

          <a-card
            a-for="date in Object.keys(combinedSchedules[site]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime()) ? 1 : -1)"
            :key="date">
            <div class="bg-grey-darken-3">
              <a-card-title>{{ new Date(date).toDateString() }}</a-card-title>
            </div>
            <div
              a-for="time in Object.keys(combinedSchedules[site][date]).sort((a, b) => (new Date(date + ' ' + a.split(' - ')[0]).getTime() > new Date(date + ' ' + b.split(' - ')[0]).getTime()) ? 1 : -1)"
              :key="time">
              <div>
                <a-card-subtitle class="py-2">
                  <span>{{ time }}</span>
                  <span class="ml-2" style="float: right">{{ combinedSchedules[site][date][time].length }}<a-icon
                      class="ml-1" icon="mdi-account-multiple" /></span>
                </a-card-subtitle>
              </div>
              <a-divider />
              <div class="pa-2">
                <a-chip a-for="schedule in Object.keys(combinedSchedules[site][date][time])" :key="schedule"
                  class="pa-4 ma-1"
                  :color="objectifiedScheduleCategories[objectifiedSchedules[schedule].scheduleCategoryID].color" label
                  prepend-icon="mdi-pencil" rounded="pill"
                  @click="configureEventForm(objectifiedEvents[combinedSchedules[site][date][time][schedule].eventID])">
                  {{ objectifiedSchedules[schedule].title }}
                </a-chip>
              </div>
            </div>
          </a-card>
        </div>
      </a-expand-transition>

    </a-card>
  </div>

  <a-drawer a-model="eventEditOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black" width="100%"
    style="overflow-y: scroll !important" persistent>
    <a-container align="right">
      <a-button @click="resetForm()" icon variant="text">
        <a-icon color="red-accent-3" size="x-large">mdi-close</a-icon>
      </a-button>
    </a-container>
    <a-card color="transparent">
      <a-card-item class="ma-0">
        <a-form>
          <a-select :items="schedules.sort((a, b) => (a.title > b.title) ? 1 : -1)" item-title="title" item-value="_id"
            a-model="eventFormData.scheduleID" label="Schedules" clearable></a-select>
          <a-select a-model="eventFormData.eventTemplateID" :item-props="true"
            :items="eventTemplates.sort((a, b) => (a.title > b.title) ? 1 : -1)" item-title="_id" item-value="_id"
            label="Event Template" clearable>
            <template a-slot:item="{ props, item }">
              <a-list-item a-bind="props" :subtitle="item.raw.description"></a-list-item>
            </template>
          </a-select>

          <a-input label="Title" a-model="eventFormData.title" a-if="!eventFormData.eventTemplateID"></a-input>
          <a-input label="Location" a-model="eventFormData.location" a-if="!eventFormData.eventTemplateID"></a-input>
          <a-textarea label="Description" a-model="eventFormData.description"
            a-if="!eventFormData.eventTemplateID"></a-textarea>

          <a-select a-model="eventFormData.timeZone" :items="timeZones" label="Time Zone" clearable
            a-if="!eventFormData.eventTemplateID"></a-select>

          <a-select a-model="eventFormData.shiftID" label="Shift" clearable
            a-if="eventFormData.eventTemplateID"></a-select>

          <div class="d-flex justify-space-between">
            <a-input label="Start Date" type="date" a-model="eventFormData.startDate"></a-input>
            <a-select :items="generateTimes(6, 0, 1, 0)" label="Start Time"
              a-model="eventFormData.startTime"></a-select>
          </div>

          <div class="d-flex justify-space-between">
            <a-input label="End Date" type="date" a-model="eventFormData.endDate"></a-input>
            <a-select :items="generateTimes(16, 30, 9, 15)" label="End Time" a-model="eventFormData.endTime"></a-select>
          </div>

          <a-select label="Frequency" a-model="eventFormData.recurrence.frequency"
            :items="recurrenceRuleOptions.freq"></a-select>
        </a-form>
      </a-card-item>
      <a-card-actions a-if="eventFormData.recurrence.frequency != 'Once'">
        <span class="ml-4">Advanced Frequency</span>
        <a-spacer></a-spacer>
        <a-button :icon="eventEditAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="eventEditAdvanced = !eventEditAdvanced"></a-button>
      </a-card-actions>
      <a-expand-transition>
        <a-card a-show="eventEditAdvanced" color="transparent">
          <a-card-item>
            <a-form>
              <a-input a-if="['Daily', 'Weekly', 'Monthly by Day'].includes(eventFormData.recurrence.frequency)"
                label="Interval" type="number" a-model="eventFormData.recurrence.interval" clearable></a-input>

              <a-select a-if="['Yearly by Day', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)"
                label="Month" a-model="eventFormData.recurrence.ByMonth"
                :items="Object.keys(recurrenceRuleOptions.advFreq.ByMonth)" clearable></a-select>

              <a-select a-if="['Monthly by Day', 'Yearly by Day'].includes(eventFormData.recurrence.frequency)"
                label="Occurrences of Week Days in Month" a-model="eventFormData.recurrence.ByDayMonthly"
                :items="Object.keys(generatedMonthDays)" multiple clearable></a-select>

              <a-select a-if="['Weekly'].includes(eventFormData.recurrence.frequency)" label="Days of Week"
                a-model="eventFormData.recurrence.byDay" :items="Object.keys(recurrenceRuleOptions.advFreq.ByDay)"
                multiple clearable></a-select>

              <a-select a-if="['Monthly by Date', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)"
                label="Day in Month" a-model="eventFormData.recurrence.ByMonthDay"
                :items="Object.keys(recurrenceRuleOptions.advFreq.ByMonthDay)" multiple clearable></a-select>

              <a-input a-if="eventFormData.recurrence.frequency != 'Once'" label="Until" type="date"
                a-model="eventFormData.until" clearable></a-input>
              <a-input a-if="eventFormData.recurrence.frequency != 'Once'" label="Until" type="date"
                a-model="eventFormData.until" clearable></a-input>
            </a-form>
          </a-card-item>
        </a-card>
      </a-expand-transition>
    </a-card>
    <a-card class="bg-red-accent-3 mb-5" a-if="eventFormErrorMessage != ''">
      <a-card-title>{{ eventFormErrorMessage }}</a-card-title>
    </a-card>

    <div class="d-flex justify-space-between pa-4">
      <a-button a-if="!eventFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
        @click="createEvent()">Create</a-button>
      <a-button a-if="eventFormData._id" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill"
        @click="updateEvent()">Save</a-button>
      <a-button a-if="eventFormData._id" size="x-large" class="bg-red-accent-3 bebas-neue-regular" rounded="pill"
        @click="deleteEvent()">Delete</a-button>
    </div>
  </a-drawer>
</template>

<script setup>
//
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
    generateTimes(minHour, minMinute, maxHour, maxMinute) {
      let tempTimes = [];
      let times = [];

      let sH = minHour;
      let sM = minMinute;

      let eH = maxHour;
      let eM = maxMinute;

      let cH = sH;
      let cM = sM;

      while (cH != eH) {
        if (cH == 23) {
          cH = 0;
        }
        tempTimes.push(cH + ":" + cM);

        if (cM == 45) {
          cH += 1;
          cM = 0;
        } else {
          cM = cM + 15;
        }
      }

      if (cH == eH) {
        while (cM != eM + 15) {
          tempTimes.push(cH + ":" + cM);
          if (cM == 45) {
            cH += 1;
            cM = 0;
          } else {
            cM = cM + 15;
          }
        }
      }

      for (let time of tempTimes) {
        times.push(this.convertToLocalTime(time));
      }

      return times;
    },
    convertToMilitaryTime(time) {
      let hour = parseInt(time.split(':')[0]);
      let minute = parseInt(time.split(':')[1]);

      if (time.includes('PM')) {
        hour = hour + 12;
        if (hour == 24) {
          hour = 0;
        }
      }

      let hourString;
      let minuteString;

      if (hour < 10) {
        hourString = '0' + hour;
      } else {
        hourString = hour.toString();
      }

      if (minute < 10) {
        minuteString = '0' + minute;
      } else {
        minuteString = minute.toString();
      }

      return hourString + ':' + minuteString;
    },
    convertToLocalTime(time) {
      let hour = parseInt(time.split(":")[0]);
      let min = parseInt(time.split(":")[1]);

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
        let tH = hour % 12;
        pTime = tH + ":" + pMin + " PM";
      } else if (hour == 0) {
        pTime = 12 + ":" + pMin + " AM";
      } else {
        console.log("Error")
      }

      return pTime;
    },
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