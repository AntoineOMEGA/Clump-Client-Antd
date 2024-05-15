<template>
  <a-float-button type="primary" @click="scheduleEditOverlayVisible = !scheduleEditOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px;margin-bottom: 15px;">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <template v-for="schedule in schedules.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="schedule._id">
    <a-card v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())"
      style="margin: 10px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
      <template #extra>
        <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px" key="calendar"
          @click="configureScheduleViewer(schedule)" />
        <EditOutlined style="font-size: 1.5rem" key="edit" @click="configureScheduleForm(schedule)" />
      </template>
      <div style="padding: 10px; background-color: #333333;">
        <a-tag v-for="tagID in schedule.tagIDs" :key="tagID"
          :color="tags[tags.findIndex((tag) => tag._id === tagID)].color">
          {{ tags[tags.findIndex((tag) => tag._id === tagID)].title }}
        </a-tag>
      </div>
    </a-card>
  </template>

  <a-drawer v-model:open="scheduleViewerOverlayVisible">
    <a-card title="Tuesday 17th, March 2024" style="background-color: #333; margin-bottom: 20px"
      :bodyStyle="{ padding: '5px' }">
      <a-button
        style="height: auto; text-align: left; margin-bottom: 10px; padding: 15px; padding-top: 10px; padding-bottom: 10px"
        block>
        <a-flex justify="space-between">
          <div>
            <a-typography-title :level="5">9:00am - 12:00pm</a-typography-title>
            <a-typography-text>ROC Indexing</a-typography-text>
          </div>
          <EditOutlined style="font-size: 1.2rem" @click="configureEventForm(event)" />
        </a-flex>
      </a-button>
    </a-card>

    <a-float-button type="primary" style="height: 60px; width: 60px"
      @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>
  </a-drawer>

  <a-drawer v-model:open="scheduleEditOverlayVisible" @close="resetScheduleForm()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="scheduleFormData.title"></a-input>
      </div>

      <div class="mb-2">
        Tag
        <a-select size="large" v-model:value="scheduleFormData.tagIDs" style="width: 100%" mode="multiple">
          <a-select-option v-for="tag in tags" :value="tag._id" :key="tag._id">
            {{ tag.title }}
          </a-select-option>
        </a-select>
      </div>

      <div class="mb-2">
        <a-flex justify="space-around" align="middle" gap="middle">
          <div>
            Start Date
            <a-date-picker size="large" v-model:value="scheduleFormData.startDate" format="MM-DD-YYYY"></a-date-picker>
          </div>
          <div>
            End Date
            <a-date-picker size="large" v-model:value="scheduleFormData.endDate" format="MM-DD-YYYY"></a-date-picker>
          </div>
        </a-flex>
      </div>

      <div class="mb-2">
        Comments
        <a-textarea size="large" v-model:value="scheduleFormData.comments"></a-textarea>
      </div>

      <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2"
        v-if="scheduleFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button v-if="!scheduleFormData._id" type="primary" size="large" block
          @click="createSchedule()">Create</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block
          @click="updateSchedule()">Save</a-button>
        <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger
          @click="deleteSchedule()">Archive</a-button>
      </a-flex>
    </a-form>
  </a-drawer>


  <a-drawer v-model:open="eventEditOverlayVisible" @close="resetEventForm()">
    <a-form>
      <div class="mb-2">
        Schedule
        <a-select v-model:value="eventFormData.scheduleID" size="large" style="width: 100%" allowClear>
          <a-select-option v-for="schedule in schedules.sort((a, b) => (a.title > b.title ? 1 : -1))"
            :value="schedule._id" :key="schedule._id">{{ schedule.title }}</a-select-option>
        </a-select>
      </div>

      <div class="mb-2">
        Event Template
        <a-select v-model:value="eventFormData.eventTemplateID" size="large" style="width: 100%" allowClear>
          <a-select-option v-for="eventTemplate in eventTemplates.sort((a, b) => (a.title > b.title ? 1 : -1))"
            :value="eventTemplate._id" :key="eventTemplate._id">{{ eventTemplate.title }}</a-select-option>
        </a-select>
      </div>

      <div v-if="!eventFormData.eventTemplateID" class="mb-2">
        Title
        <a-input size="large" v-model:value="eventFormData.title" allowClear></a-input>
      </div>

      <div v-if="!eventFormData.eventTemplateID" class="mb-2">
        Location
        <a-input size="large" v-model:value="eventFormData.location" allowClear></a-input>
      </div>

      <div v-if="!eventFormData.eventTemplateID" class="mb-2">
        Description
        <a-textarea size="large" v-model:value="eventFormData.description" allowClear></a-textarea>
      </div>

      <div v-if="!eventFormData.eventTemplateID" class="mb-2">
        Time Zone
        <a-select v-model:value="eventFormData.timeZone" size="large" style="width: 100%" allowClear>
          <a-select-option v-for="timeZone in timeZones" :value="timeZone" :key="timeZone">
            {{ timeZone }}
          </a-select-option>
        </a-select>
      </div>
      <!--
      <div v-if="eventFormData.eventTemplateID" class="mb-2">
        Shift
        <a-select v-model:value="eventFormData.shiftID">
          <a-select-option v-for="shift in timeZones" :value="timeZone" :key="timeZone">
            {{ timeZone }}
          </a-select-option>
        </a-select>
      </div>
      -->
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

      <div class="mb-2">
        Frequency
        <a-select v-model:value="eventFormData.recurrence.frequency" size="large" style="width: 100%" allowClear>
          <a-select-option v-for="option in recurrenceRuleOptions.freq" :value="option" :key="option">
            {{ option }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="['Daily', 'Weekly', 'Monthly by Day'].includes(eventFormData.recurrence.frequency)" class="mb-2">
        Interval
        <a-input type="number" v-model:value="eventFormData.recurrence.interval" allowClear></a-input>
      </div>

      <div v-if="['Yearly by Day', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)" class="mb-2">
        Month
        <a-select v-model:value="eventFormData.recurrence.ByMonth" size="large" style="width: 100%" allowClear>
          <a-select-option v-for="month in Object.keys(recurrenceRuleOptions.advFreq.ByMonth)" :value="month"
            :key="month">
            {{ month }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="['Monthly by Day', 'Yearly by Day'].includes(eventFormData.recurrence.frequency)" class="mb-2">
        Occurrences of Week Days in Month
        <a-select v-model:value="eventFormData.recurrence.ByDayMonthly" size="large" style="width: 100%" allowClear
          mode="multiple">
          <a-select-option v-for="monthDay in Object.keys(generatedMonthDays)" :value="monthDay" :key="monthDay">
            {{ monthDay }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="['Weekly'].includes(eventFormData.recurrence.frequency)" class="mb-2">
        Days of Week
        <a-select v-model:value="eventFormData.recurrence.byDay" size="large" style="width: 100%" allowClear
          mode="multiple">
          <a-select-option v-for="weekDay in Object.keys(recurrenceRuleOptions.advFreq.ByDay)" :value="weekDay"
            :key="weekDay">
            {{ weekDay }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="['Monthly by Date', 'Yearly by Date'].includes(eventFormData.recurrence.frequency)" class="mb-2">
        Day in Month
        <a-select v-model:value="eventFormData.recurrence.ByMonthDay" size="large" style="width: 100%" allowClear
          mode="multiple">
          <a-select-option v-for="dayInMonth in Object.keys(recurrenceRuleOptions.advFreq.ByMonthDay)"
            :value="dayInMonth" :key="dayInMonth">
            {{ dayInMonth }}
          </a-select-option>
        </a-select>
      </div>

      <div v-if="eventFormData.recurrence.frequency != 'Once'" class="mb-2">
        Until Date
        <a-date-picker size="large" v-model:value="eventFormData.until" format="MM-DD-YYYY" style="width: 100%"
          allowClear></a-date-picker>
      </div>
    </a-form>

    <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2"
      v-if="eventFormErrorMessage != ''" />

    <a-flex justify="space-around" align="middle" gap="middle">
      <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block @click="updateEvent()">Save</a-button>
      <a-button v-if="eventFormData._id" type="primary" size="large" block danger
        @click="deleteEvent()">Delete</a-button>
    </a-flex>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() {
    this.getSchedules();
    this.getTags();
  },
  data() {
    return {
      scheduleViewerOverlayVisible: false,
      scheduleEditOverlayVisible: false,
      scheduleFormData: {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs(),
        comments: ''
      },
      scheduleFormErrorMessage: '',
      schedules: [],
      tags: [],
      scheduleFilterSettings: {
        details: false,
        search: ''
      },

      eventEditOverlayVisible: false,
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
      },

      eventTemplates: [],
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
    configureScheduleViewer(schedule) {
      console.log(schedule);
      //Should make a request to server for events now
      this.scheduleViewerOverlayVisible = true;
    },
    resetScheduleForm() {
      this.scheduleEditOverlayVisible = false;
      this.scheduleFormData = {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs(),
        comments: ''
      };
      this.scheduleFormErrorMessage = '';
    },
    getSchedules() {
      fetch('/api/v1/schedules', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.schedules = data.data.schedules;
          }
        });
      });
    },
    createSchedule() {
      fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: this.scheduleFormData.tagIDs,
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    configureScheduleForm(schedule) {
      this.scheduleFormData.title = schedule.title;
      this.scheduleFormData.tagIDs = schedule.tagIDs;
      this.scheduleFormData._id = schedule._id;
      this.scheduleFormData.comments = schedule.comments;
      this.scheduleFormData.startDate = dayjs(schedule.startDate);
      this.scheduleFormData.endDate = dayjs(schedule.endDate);

      this.scheduleEditOverlayVisible = true;
    },
    updateSchedule() {
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: this.scheduleFormData.tagIDs,
          comments: this.scheduleFormData.comments
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex((schedule) => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    deleteSchedule() {
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 204) {
            let indexOfDeletedSchedule = this.schedules.findIndex((schedule) => schedule._id === this.scheduleFormData._id);
            this.schedules.splice(indexOfDeletedSchedule, 1);

            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    getTags() {
      fetch('/api/v1/tags', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.tags = data.data.tags;
          }
        });
      });
    },
    resetEventForm() {
      this.eventEditOverlayVisible = false;
      this.eventEditAdvanced = false;
      this.eventFormData = {
        title: '',
        description: '',
        location: '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startDate: dayjs(),
        endDate: dayjs(),
        startTime: dayjs(),
        endTime: dayjs(),
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
        startDateTime: dayjs(this.eventFormData.startDate + 'T' + this.eventFormData.startTime),
        endDateTime: dayjs(this.eventFormData.endDate + 'T' + this.eventFormData.endTime),

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
            this.resetEventForm();
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

      this.eventFormData.startDate = dayjs(event.startDateTime);
      this.eventFormData.endDate = dayjs(event.startDateTime);
      this.eventFormData.startTime = dayjs(event.startDateTime);
      this.eventFormData.endTime = dayjs(event.startDateTime);

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
