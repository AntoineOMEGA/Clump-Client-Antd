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
    <template v-for="schedule in schedules.sort((a, b) => (a.title > b.title ? 1 : -1))" :key="schedule._id">
      <a-card v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())" style="margin: 10px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
        <template #extra>
          <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px" key="calendar" @click="configureScheduleViewer(schedule)" />
          <EditOutlined style="font-size: 1.5rem" key="edit" @click="configureScheduleForm(schedule)" />
        </template>
        <div style="padding: 10px; background-color: #333333" v-if="schedule.tagIDs.length > 0">
          <a-tag v-for="tagID in schedule.tagIDs" :key="tagID" :color="tags[tags.findIndex((tag) => tag._id === tagID)].color">
            {{ tags[tags.findIndex((tag) => tag._id === tagID)].title }}
          </a-tag>
        </div>
      </a-card>
    </template>
  </a-spin>

  <a-drawer v-model:open="scheduleViewerOverlayVisible" :bodyStyle="{ padding: '15px' }">
    <a-flex justify="space-between" class="mb-2">
      <a-date-picker size="large" picker="week" format="[Week of] MM/DD" v-model:value="selectedWeek" />
      <div>
        <a-button size="large" style="margin-right: 10px">
          <CaretLeftOutlined style="font-size: 1.2rem" @click="changeWeek('backward')" />
        </a-button>
        <a-button size="large">
          <CaretRightOutlined style="font-size: 1.2rem" @click="changeWeek('forward')" />
        </a-button>
      </div>
    </a-flex>

    <a-timeline>
      <a-timeline-item color="red" v-for="day in 6" :key="day">
        <a-typography-title :level="4">{{ dayjs(selectedWeek).day(day).format('MM/DD/YYYY') }}</a-typography-title>
        <a-spin :spinning="eventLoadSpinning">
          <div v-for="event in events.sort((a, b) => (a.startDateTime >= b.startDateTime ? 1 : -1))" :key="event._id">
            <a-card v-if="dayjs(event.startDateTime).format('MM/DD/YYYY') == dayjs(selectedWeek).day(day).format('MM/DD/YYYY')" :bodyStyle="{ padding: '15px' }" style="background-color: #333333; margin-bottom: 10px">
              <a-flex justify="space-between">
                <a-card-meta :title="event.title">
                  <template #description
                    >{{ dayjs(event.startDateTime).format('h:mm A') }} to
                    {{ dayjs(event.endDateTime).format('h:mm A') }}
                  </template>
                </a-card-meta>
                <EditOutlined style="font-size: 1.5rem" @click="configureEventForm(event)" />
              </a-flex>
            </a-card>
          </div>
        </a-spin>
      </a-timeline-item>
    </a-timeline>

    <a-float-button type="primary" style="height: 60px; width: 60px" @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>
  </a-drawer>

  <a-drawer v-model:open="scheduleEditOverlayVisible" @close="resetScheduleForm()">
    <a-spin :spinning="scheduleSpinning">
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

        <a-alert message="Error" :description="scheduleFormErrorMessage" type="error" class="mb-2" v-if="scheduleFormErrorMessage != ''" />

        <a-flex justify="space-around" align="middle" gap="middle">
          <a-button v-if="!scheduleFormData._id" type="primary" size="large" block @click="createSchedule()">Create</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block @click="updateSchedule()">Save</a-button>
          <a-button v-if="scheduleFormData._id" type="primary" size="large" block danger @click="deleteSchedule()">Delete</a-button>
        </a-flex>
      </a-form>
    </a-spin>
  </a-drawer>

  <a-drawer v-model:open="eventEditOverlayVisible" @close="resetEventForm()">
    <a-spin :spinning="eventSpinning">
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

        <div class="mb-2">
          Frequency
          <a-select v-model:value="eventFormData.frequency" size="large" style="width: 100%" allowClear>
            <a-select-option v-for="option in recurrenceRuleOptions.freq" :value="option" :key="option">
              {{ option }}
            </a-select-option>
          </a-select>
        </div>

        <div v-if="eventFormData.frequency != 'Once'" class="mb-2">
          Interval
          <a-input type="number" v-model:value="eventFormData.interval" allowClear></a-input>
        </div>

        <div v-if="eventFormData.frequency != 'Once'" class="mb-2">
          Until Date
          <a-date-picker size="large" v-model:value="eventFormData.untilDateTime" format="MM-DD-YYYY" style="width: 100%" allowClear></a-date-picker>
        </div>
      </a-form>

      <a-alert message="Error" :description="eventFormErrorMessage" type="error" class="mb-2" v-if="eventFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button v-if="!eventFormData._id" type="primary" size="large" block @click="createEvent()">Create</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block @click="eventUpdatePopoverVisible = true">Save</a-button>
        <a-button v-if="eventFormData._id" type="primary" size="large" block danger @click="eventDeletePopoverVisible = true">Delete</a-button>
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
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined, CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
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
        frequency: 'Once',
        interval: 0,
        untilDateTime: dayjs(),
        scheduleID: '',
        eventTemplateID: ''
      },

      timeZones: new Intl.Locale('en-US').timeZones,
      recurrenceRuleOptions: {
        freq: ['Once', 'Weekly']
      }
    };
  },
  methods: {
    changeWeek(direction) {
      if (direction == 'forward') {
        this.selectedWeek = this.selectedWeek.add(7, 'day');
      }
      if (direction == 'backward') {
        this.selectedWeek = this.selectedWeek.subtract(7, 'day');
      }
    },
    configureScheduleViewer(schedule) {
      //Should make a request to server for events now
      this.scheduleViewerOverlayVisible = true;
      this.eventFormData.scheduleID = schedule._id;

      this.getEventsOnSchedule(schedule._id);
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
    getEventsOnSchedule(scheduleID) {
      this.eventLoadSpinning = true;
      fetch('/api/v1/events/onSchedule/' + scheduleID, {
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
        eventTemplateID: ''
      };
      this.eventFormErrorMessage = '';
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
            this.events.push(data.data.newEvent);
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
      this.eventFormData.endTime = dayjs(event.startDateTime);

      this.eventFormData.frequency = event.frequency;
      this.eventFormData.interval = event.interval;
      this.eventFormData.untilDateTime = dayjs(event.untilDateTime);

      this.eventFormData.scheduleID = event.scheduleID;
      this.eventFormData.eventTemplateID = event.eventTemplateID;

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
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.event._id);
            this.events[indexOfUpdatedEvent] = data.data.event;
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
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.event._id);
            this.events[indexOfUpdatedEvent] = data.data.event;
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
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.currentEvent._id);
            this.events[indexOfUpdatedEvent] = data.data.currentEvent;
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
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.event._id);
            this.events[indexOfUpdatedEvent] = data.data.event;
            this.resetEventForm();
          } else {
            this.eventFormErrorMessage = data.message;
            this.eventSpinning = false;
          }
        });
      });
    },
    deleteEvent() {
      this.eventSpinning = true;
      fetch('/api/v1/events/' + this.eventFormData._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          let indexOfDeletedEvent = this.events.findIndex((event) => event._id === this.eventFormData._id);
          this.events.splice(indexOfDeletedEvent, 1);

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
      let eventBody = { startDateTime: this.eventFormData.startDate.hour(dayjs(this.eventFormData.startTime, 'HH:mm:ss').hour()).minute(dayjs(this.eventFormData.startTime, 'HH:mm:ss').minute()).second(dayjs(this.eventFormData.startTime, 'HH:mm:ss').second()) };

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
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.event._id);
            this.events[indexOfUpdatedEvent] = data.data.event;
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
          if (response.status === 201) {
            let indexOfUpdatedEvent = this.events.findIndex((event) => event._id === data.data.event._id);
            this.events[indexOfUpdatedEvent] = data.data.event;
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
          let indexOfDeletedEvent = this.events.findIndex((event) => event._id === this.eventFormData._id);
          this.events.splice(indexOfDeletedEvent, 1);

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
