<template>
  <a-float-button type="primary" @click="scheduleEditOverlayVisible = !scheduleEditOverlayVisible" style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px; margin-bottom: 15px">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <a-spin :spinning="scheduleLoadSpinning">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="schedule in schedules.sort((a, b) => (a.title >= b.title ? 1 : -1))" :key="schedule._id">
        <a-card v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())" style="margin: 10px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
          <template #extra>
            <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px" key="calendar" @click="configureScheduleViewer(schedule)" />
            <ShareAltOutlined style="font-size: 1.5rem; margin-right: 15px" key="share" @click="configureScheduleSharingForm(schedule)" />
            <EditOutlined style="font-size: 1.5rem" key="edit" @click="configureScheduleForm(schedule)" />
          </template>
          <div style="padding: 10px; background-color: #333333" v-if="schedule.tagIDs.length > 0">
            <a-tag v-for="tagID in schedule.tagIDs" :key="tagID" :color="tags[tags.findIndex((tag) => tag._id === tagID)].color">
              {{ tags[tags.findIndex((tag) => tag._id === tagID)].title }}
            </a-tag>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>

  <ScheduleViewer :visible="scheduleViewerOverlayVisible" :events="events" />
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import ScheduleViewer from '@/components/ScheduleViewer.vue';
</script>

<script>
export default {
  mounted() {
    this.getTags();
    this.getSchedules();
  },
  data() {
    return {
      selectedWeek: dayjs(),
      scheduleViewerOverlayVisible: false,
      scheduleSharingOverlayVisible: false,
      scheduleEditOverlayVisible: false,
      scheduleLoadSpinning: false,
      scheduleSpinning: false,
      scheduleFormData: {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs()
      },
      scheduleFormErrorMessage: '',
      schedules: [],
      eventTemplates: [],
      events: [],
      tags: [],
      scheduleFilterSettings: {
        details: false,
        search: ''
      },

      eventEditOverlayVisible: false,
      eventUpdatePopoverVisible: false,
      eventDeletePopoverVisible: false,
      recurrenceRuleModalVisible: false,
      eventLoadSpinning: false,
      eventSpinning: false,
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
        scheduleID: '',
        eventTemplateID: ''
      },
      timeZones: new Intl.Locale('en-US').timeZones,

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
        },
        endOptions: ['Not Set', 'Until Date', 'Occurrences']
      },

      recurrenceRuleFormData: {
        _id: null,
        frequency: 'Weekly',
        byDay: '',
        byWeekInMonth: 1,
        byMonthDay: 1,
        byMonth: 1,
        interval: 1,
        end: 'Not Set',
        untilDateTime: dayjs(),
        occurrences: 0
      },

      scheduleLinks: []
    };
  },
  computed: {
    generatedMonthDays() {
      let monthDays = {};
      for (let dayExtended of Object.keys(this.recurrenceRuleOptions.byWeekInMonth)) {
        for (let day of Object.keys(this.recurrenceRuleOptions.byDay)) {
          monthDays[dayExtended + ' ' + day] = this.recurrenceRuleOptions.byWeekInMonth[dayExtended] + this.recurrenceRuleOptions.byDay[day];
        }
      }
      return monthDays;
    }
  },
  methods: {
    configureScheduleViewer(schedule) {
      //Should make a request to server for events now
      this.scheduleViewerOverlayVisible = true;
      this.eventFormData.scheduleID = schedule._id;

      this.getEventsOnSchedule(schedule._id);
    },
    getScheduleLinks(scheduleID) {
      fetch(`/api/v1/schedules/${scheduleID}/scheduleLinks/`, {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.scheduleLinks = data.data.scheduleLinks;
          }
        });
      });
    },
    createScheduleLink() {
      fetch(`/api/v1/schedules/${this.scheduleID}/scheduleLinks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: this.scheduleLinkFormData.recipients
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.scheduleLinks.push(data.data.scheduleLinks);
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    configureScheduleSharingForm(schedule) {
      this.scheduleSharingOverlayVisible = true;
      this.getScheduleLinks(schedule._id);
    },

    resetScheduleForm() {
      this.scheduleSpinning = false;
      this.scheduleEditOverlayVisible = false;
      this.scheduleFormData = {
        title: '',
        tagIDs: [],
        startDate: dayjs(),
        endDate: dayjs()
      };
      this.scheduleFormErrorMessage = '';
    },
    getSchedules() {
      this.scheduleLoadSpinning = true;
      fetch('/api/v1/schedules', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.schedules = data.data.schedules;
          }
          this.scheduleLoadSpinning = false;
        });
      });
    },
    createSchedule() {
      this.scheduleSpinning = true;
      fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: this.scheduleFormData.tagIDs,
          startDate: this.scheduleFormData.startDate,
          endDate: this.scheduleFormData.endDate
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.schedules.push(data.data.schedule);
            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleSpinning = false;
          }
        });
      });
    },
    configureScheduleForm(schedule) {
      this.scheduleFormData.title = schedule.title;
      this.scheduleFormData.tagIDs = schedule.tagIDs;
      this.scheduleFormData._id = schedule._id;
      this.scheduleFormData.startDate = dayjs(schedule.startDate);
      this.scheduleFormData.endDate = dayjs(schedule.endDate);

      this.scheduleEditOverlayVisible = true;
    },
    updateSchedule() {
      this.scheduleSpinning = true;
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.scheduleFormData.title,
          tagIDs: this.scheduleFormData.tagIDs
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            let indexOfUpdatedSchedule = this.schedules.findIndex((schedule) => schedule._id === data.data.schedule._id);
            this.schedules[indexOfUpdatedSchedule] = data.data.schedule;

            this.resetScheduleForm();
          } else {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleSpinning = false;
          }
        });
      });
    },
    deleteSchedule() {
      this.scheduleSpinning = true;
      fetch('/api/v1/schedules/' + this.scheduleFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          let indexOfDeletedSchedule = this.schedules.findIndex((schedule) => schedule._id === this.scheduleFormData._id);
          this.schedules.splice(indexOfDeletedSchedule, 1);

          this.resetScheduleForm();
        } else {
          response.json().then((data) => {
            this.scheduleFormErrorMessage = data.message;
            this.scheduleSpinning = false;
          });
        }
      });
    },
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
    getEvents() {
      this.eventLoadSpinning = true;
      fetch('/api/v1/events', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.events = data.data.events;
          }
          this.eventLoadSpinning = false;
        });
      });
    },
    requestICAL() {
      this.eventLoadSpinning = true;
      fetch('/api/v1/schedules/ical', {
        method: 'GET'
      }).then((response) => {
        response.text().then((data) => {
          if (response.status === 200) {
            console.log(data);
          }
          this.eventLoadSpinning = false;
        });
      });
    },
    getEventsOnSchedule(scheduleID) {
      this.eventLoadSpinning = true;
      let startDateTime = this.selectedWeek.startOf('week');
      let endDateTime = this.selectedWeek.endOf('week');
      fetch('/api/v1/events/onSchedule/' + scheduleID + '?startDateTime=' + startDateTime.toISOString() + '&endDateTime=' + endDateTime.toISOString(), {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.events = data.data.events;
          }
          this.eventLoadSpinning = false;
        });
      });
    },
    resetEventForm() {
      this.eventEditOverlayVisible = false;
      this.eventEditAdvanced = false;
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
        frequency: 'Once',
        interval: 0,
        untilDateTime: dayjs(),
        parentEventID: '',
        scheduleID: this.eventFormData.scheduleID
      };

      this.eventFormErrorMessage = '';
      this.eventSpinning = true;
    },
    createEventBody() {
      let eventBody = {};

      eventBody = {
        title: this.eventFormData.title,
        description: this.eventFormData.description,
        location: this.eventFormData.location,
        startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()),
        endDateTime: this.eventFormData.endDate.hour(dayjs(this.eventFormData.endTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.endTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.endTime, 'HH:mm:ss').second()),

        scheduleID: this.eventFormData.scheduleID,
        parentEventID: this.eventFormData.parentEventID,

        frequency: this.eventFormData.frequency,
        interval: this.eventFormData.interval,
        untilDateTime: this.eventFormData.untilDateTime
      };

      return eventBody;
    },
    createEvent() {
      this.eventSpinning = true;
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
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
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

      this.eventEditOverlayVisible = true;
      this.eventEditAdvanced = false;
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
      this.eventSpinning = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventSpinning = false;
          if (response.status === 200) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    updateThisEvent() {
      this.eventSpinning = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/thisEvent/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventSpinning = false;
          if (response.status === 201) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    updateThisAndFollowingEvents() {
      this.eventSpinning = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/thisAndFollowingEvents/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventSpinning = false;
          if (response.status === 201) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    updateAllEvents() {
      this.eventSpinning = true;
      let eventBody = this.createEventBody();

      fetch('/api/v1/events/allEvents/' + this.eventFormData._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventSpinning = false;
          if (response.status === 200) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
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
      this.eventSpinning = true;
      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.getEventsOnSchedule(this.eventFormData.scheduleID);
          this.resetEventForm();
        } else {
          response.json().then((data) => {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          });
        }
      });
    },
    deleteThisEvent() {
      this.eventSpinning = true;
      let eventBody = { scheduleID: this.eventFormData.scheduleID, startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()) };

      fetch('/api/v1/events/thisEvent/' + this.eventFormData._id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }).then((response) => {
        response.json().then((data) => {
          this.eventSpinning = false;
          if (response.status === 201) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    deleteThisAndFollowingEvents() {
      this.eventSpinning = true;
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
          this.eventSpinning = false;
          if (response.status === 200) {
            this.getEventsOnSchedule(this.eventFormData.scheduleID);
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    deleteAllEvents() {
      this.eventSpinning = true;
      fetch('/api/v1/events/allEvents/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.getEventsOnSchedule(this.eventFormData.scheduleID);
          this.resetEventForm();
        } else {
          response.json().then((data) => {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          });
        }
      });
    }
  }
};
</script>
