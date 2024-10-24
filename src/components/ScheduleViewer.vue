<template>
  <a-drawer :open="visible" :bodyStyle="{ padding: '15px' }" @close="close()" :title="schedule.title">
    <a-flex justify="space-between" class="mb-2">
      <a-date-picker size="large" picker="week" format="[Week of] MM/DD" v-model:value="selectedWeek" />
      <div>
        <a-button size="large" style="margin-right: 10px" @click="changeWeek('backward')">
          <CaretLeftOutlined style="font-size: 1.2rem" />
        </a-button>
        <a-button size="large" @click="changeWeek('forward')">
          <CaretRightOutlined style="font-size: 1.2rem" />
        </a-button>
      </div>
    </a-flex>

    <a-spin :spinning="eventsLoading">
      <a-timeline>
        <a-timeline-item :color="schedule.color" v-for="day in 7" :key="day - 1">
          <a-typography-title :level="4">
            {{
              dayjs(selectedWeek)
                .day(day - 1)
                .format('dddd [-] MM/DD/YYYY')
            }}</a-typography-title
          >

          <div v-for="event in sortedEvents" :key="event._id">
            <a-card
              v-if="
                dayjs(event.startDateTime).format('MM/DD/YYYY') ==
                dayjs(selectedWeek)
                  .day(day - 1)
                  .format('MM/DD/YYYY')
              "
              :bodyStyle="{ padding: '15px' }"
              style="background-color: #333; margin-bottom: 10px; text-wrap: wrap"
              :style="`opacity: ${event.status == 'cancelled' ? '50%' : '100%'};`"
              :hoverable="true"
              :bordered="false"
              :title="event.title"
            >
              <template #extra>
                <UserAddOutlined
                  style="font-size: 1.5rem; margin-right: 15px"
                  key="share"
                  @click="
                    selectedEvent = event;
                    eventAttendeeModalVisible = true;
                  "
                  v-if="!event.isAttending"
                />
                <EditOutlined
                  v-if="!event.isAttending && event.status != 'cancelled'"
                  style="font-size: 1.5rem"
                  key="edit"
                  @click="
                    selectedEvent = event;
                    eventEditOverlayVisible = true;
                  "
                />
                <EditOutlined
                  v-if="event.isAttending && event.status != 'cancelled'"
                  style="font-size: 1.5rem"
                  key="edit"
                  @click="
                    selectedEvent = event;
                    eventAttendeeModalVisible = true;
                  "
                />
                <EditOutlined
                  v-if="event.status == 'cancelled'"
                  style="font-size: 1.5rem"
                  key="edit"
                  @click="
                    selectedEventException = event.exception;
                    eventExceptionModalVisible = true;
                  "
                />
              </template>
              <a-flex justify="space-between">
                <a-card-meta>
                  <template #title v-if="event.isAttendee">
                    {{ event.title }}
                  </template>
                  <template #description
                    >{{ dayjs(event.startDateTime).format('h:mm A') }} to
                    {{ dayjs(event.endDateTime).format('h:mm A') }}
                  </template>
                </a-card-meta>
                <template v-if="event.attendees.length > 0">
                  <div class="attendee-count">
                    <span>{{ event.attendees.length > 0 && event.maxAttendees > 0 ? `${event.attendees.length}/${event.maxAttendees}` : `${event.attendees.length}` }}</span>
                  </div>
                </template>
              </a-flex>
              <div>
                <a-tag v-for="attendee in event.attendees" :key="attendee.attendeeID" :style="`opacity: ${attendee.status == 'cancelled' ? '50%' : '100%'};`" @click="attendee.status == 'cancelled' ? (eventExceptionModalVisible = true) : (eventAttendeeModalVisible = true)">
                  {{ getAttendeeScheduleTitle(attendee) }}
                </a-tag>
              </div>
            </a-card>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-spin>

    <a-float-button type="primary" style="height: 60px; width: 60px" @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>

    <EventEditor
      :visible="eventEditOverlayVisible"
      :scheduleID="schedule._id"
      :event="selectedEvent"
      @close="
        eventEditOverlayVisible = false;
        selectedEvent = {};
        getEventsOnSchedule();
      "
    />

    <EventAttendeeEditor
      :visible="eventAttendeeModalVisible"
      :event="selectedEvent"
      :attendee="selectedAttendee"
      @close="
        eventAttendeeModalVisible = false;
        selectedEvent = {};
        getEventsOnSchedule();
      "
    />

    <EventExceptionModal
      :visible="eventExceptionModalVisible"
      :exception="selectedEventException"
      @close="
        eventExceptionModalVisible = false;
        selectedEventException = '';
        getEventsOnSchedule();
      "
    />
  </a-drawer>
</template>

<style scoped>
.ant-card-head {
  padding: 0 10px !important;
}

.ant-card-head-title,
.ant-card-meta-title {
  text-wrap: wrap !important;
}

.ant-card-head-title {
  padding: 15px 10px;
}

.ant-card-meta-title {
  padding: 10px;
}

.ant-card-extra {
  margin-right: 10px;
}

.attendee-count {
  padding: 10px 15px;
  text-align: center;
  font-weight: bold;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #222;
}
</style>

<script setup>
import { PlusOutlined, CaretRightOutlined, CaretLeftOutlined, EditOutlined, UserAddOutlined } from '@ant-design/icons-vue';
import EventEditor from './EventEditor.vue';
import EventAttendeeEditor from './EventAttendeeEditor.vue';
import EventExceptionModal from './EventExceptionModal.vue';
import dayjs from 'dayjs';
import { datetime, RRule } from 'rrule';
</script>

<script>
export default {
  props: ['visible', 'schedule'],
  emits: ['close'],
  updated() {
    if (this.visible) {
      this.getEventsOnSchedule();
      this.getSchedules();
    }
    let timelineTails = document.querySelectorAll('.ant-timeline-item-tail');
    for (let tail of timelineTails) {
      tail.style.backgroundColor = this.schedule.color;
    }
  },
  data() {
    return {
      selectedWeek: dayjs(),
      eventsLoading: false,
      events: [],
      attendees: [],
      eventExceptions: [],
      attendingEvents: [],
      refinedEvents: [],
      schedules: [],

      eventEditOverlayVisible: false,
      eventAttendeeModalVisible: false,
      eventExceptionModalVisible: false,

      selectedEvent: {},
      selectedEventException: ''
    };
  },
  computed: {
    sortedEvents() {
      return this.refineEvents(this.events, this.attendees, this.eventExceptions, this.attendingEvents).sort((a, b) => (a.startDateTime >= b.startDateTime ? 1 : -1));
    }
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
    getEventsOnSchedule() {
      this.eventsLoading = true;
      let startDateTime = this.selectedWeek.startOf('week');
      let endDateTime = this.selectedWeek.endOf('week');
      fetch('/api/v1/events/onSchedule/' + this.schedule._id + '?startDateTime=' + startDateTime.toISOString() + '&endDateTime=' + endDateTime.toISOString(), {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.events = data.data.events;
            this.attendees = data.data.attendees;
            this.eventExceptions = data.data.eventExceptions;
            this.attendingEvents = data.data.attendingEvents;
          }
          this.eventsLoading = false;
        });
      });
    },
    close() {
      this.$emit('close');
    },
    getAttendeeScheduleTitle(attendee) {
      for (let cSchedule of this.schedules) {
        if (cSchedule._id == attendee.scheduleID) {
          return cSchedule.title;
        }
      }
    },
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
    findInstancesInRange(eventStartDateTime, eventEndDateTime, recurrenceRule, rangeStartDateTime, rangeEndDateTime) {
      let rruleString;
      if (recurrenceRule.frequency == 'Daily' || recurrenceRule.frequency == 'Weekly') {
        rruleString = 'FREQ=' + recurrenceRule.frequency + ';';
      } else if (recurrenceRule.frequency == 'Monthly by day' || recurrenceRule.frequency == 'Monthly by date') {
        rruleString = 'FREQ=MONTHLY;';
      } else if (recurrenceRule.frequency == 'Yearly by day' || recurrenceRule.frequency == 'Yearly by date') {
        rruleString = 'FREQ=YEARLY;';
      }

      if (recurrenceRule.interval) {
        rruleString = rruleString + 'INTERVAL=' + recurrenceRule.interval + ';';
      }

      if (recurrenceRule.byMonth) {
        rruleString = rruleString + 'BYMONTH=' + recurrenceRule.byMonth + ';';
      }

      if (recurrenceRule.byDay && recurrenceRule.byDay.length > 0) {
        let byDayString = '';
        for (let day of recurrenceRule.byDay) {
          byDayString = byDayString + day + ',';
        }
        rruleString = rruleString + 'BYDAY=' + byDayString.substring(0, byDayString.length - 1) + ';';
      }

      if (recurrenceRule.byWeekDayInMonth && recurrenceRule.byWeekDayInMonth.length > 0) {
        let byWeekDayInMonthString = '';
        for (let day of recurrenceRule.byWeekDayInMonth) {
          byWeekDayInMonthString = byWeekDayInMonthString + day + ',';
        }
        rruleString = rruleString + 'BYDAY=' + byWeekDayInMonthString.substring(0, byWeekDayInMonthString.length - 1) + ';';
      }

      if (recurrenceRule.byMonthDay && recurrenceRule.byMonthDay.length > 0) {
        let byMonthDayString = '';
        for (let day of recurrenceRule.byMonthDay) {
          byMonthDayString = byMonthDayString + day + ',';
        }
        rruleString = rruleString + 'BYMONTHDAY=' + byMonthDayString.substring(0, byMonthDayString.length - 1) + ';';
      }

      if (recurrenceRule.untilDateTime) {
        rruleString = rruleString + 'UNTIL=' + new Date(recurrenceRule.untilDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';
      }

      if (recurrenceRule.occurrences) {
        rruleString = rruleString + 'COUNT=' + recurrenceRule.occurrences + ';';
      }

      rruleString = rruleString + 'DTSTART=' + new Date(eventStartDateTime).toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + ';';

      const rrule = RRule.fromString(rruleString.substring(0, rruleString.length - 1));

      let tStart = new Date(rangeStartDateTime);
      let tEnd = new Date(rangeEndDateTime);

      let dates = rrule.between(datetime(tStart.getUTCFullYear(), tStart.getUTCMonth() + 1, tStart.getUTCDate()), datetime(tEnd.getUTCFullYear(), tEnd.getUTCMonth() + 1, tEnd.getUTCDate()));

      //ADD Original Start Date Time to Instances (compatibility with ICal calendars elsewhere)
      if (eventEndDateTime >= new Date(rangeStartDateTime) && eventStartDateTime <= new Date(rangeEndDateTime)) {
        let found = false;
        for (let date of dates) {
          if (date.toISOString() == eventStartDateTime.toISOString().split('.')[0] + '.000Z') {
            found = true;
          }
        }

        if (!found) {
          //let originDate = eventStartDateTime;
          dates.unshift(new Date(eventStartDateTime.toISOString().split('.')[0] + '.000Z'));
        }
      }

      return dates;
    },
    refineEvents(events, attendees, eventExceptions, attendingEvents) {
      let refinedEvents = [];
      let rangeStartDateTime = this.selectedWeek.startOf('week');
      let rangeEndDateTime = this.selectedWeek.endOf('week');

      for (let event of events) {
        if (event.recurrenceRule) {
          let dates = this.findInstancesInRange(event.startDateTime, event.endDateTime, event.recurrenceRule, rangeStartDateTime, rangeEndDateTime);

          for (let date of dates) {
            let startDateTimeTemp = dayjs(event.startDateTime);
            let endDateTimeTemp = dayjs(event.endDateTime);
            let timeBetweenStartAndEnd = endDateTimeTemp.diff(startDateTimeTemp);

            let endDateTime = dayjs(date).add(timeBetweenStartAndEnd, 'millisecond');
            let eventInstance = {
              _id: event._id,
              isInstance: true,

              scheduleID: event.scheduleID,
              title: event.title,
              description: event.description,
              location: event.location,
              timeZone: event.timeZone,
              startDateTime: date.toISOString(), //adjust for new date
              endDateTime: endDateTime.toISOString(), //adjust for new date
              recurrenceRule: event.recurrenceRule,
              maxAttendees: event.maxAttendees,

              attendees: []
            };

            eventExceptions.forEach(function (eventException) {
              if ((eventException.eventID == event._id.toString(), new Date(eventException.startDateTime).toISOString() == new Date(date).toISOString())) {
                eventInstance.status = 'cancelled';
                eventInstance.exception = eventException._id;
              }
            });

            attendees.forEach(function (attendee) {
              if (attendee.eventID.toString() == event._id.toString()) {
                let attendeeDateRangeParameters = {};

                if (attendee.startDateTime) {
                  attendeeDateRangeParameters.startDateTime = attendee.startDateTime;
                } else {
                  attendeeDateRangeParameters.startDateTime = event.startDateTime;
                }

                if (attendee.endDateTime) {
                  attendeeDateRangeParameters.endDateTime = attendee.endDateTime;
                } else {
                  attendeeDateRangeParameters.endDateTime = event.endDateTime;
                }

                attendeeDateRangeParameters.recurrenceRule = event.recurrenceRule;
                if (attendee.recurrenceRule.untilDateTime) {
                  attendeeDateRangeParameters.recurrenceRule.untilDateTime = attendee.recurrenceRule.untilDateTime;
                }
                if (attendee.recurrenceRule.occurrences) {
                  attendeeDateRangeParameters.recurrenceRule.occurrences = attendee.recurrenceRule.occurrences;
                }

                let attendeeDates = this.findInstancesInRange(attendeeDateRangeParameters.startDateTime, attendeeDateRangeParameters.endDateTime, attendeeDateRangeParameters.recurrenceRule, rangeStartDateTime, rangeEndDateTime);

                for (let attendeeDate of attendeeDates) {
                  if (attendeeDate >= date && attendeeDate <= endDateTime) {
                    let startDateTimeTemp = dayjs(event.startDateTime);
                    let endDateTimeTemp = dayjs(event.endDateTime);
                    let timeBetweenStartAndEnd = endDateTimeTemp.diff(startDateTimeTemp);

                    let endDateTime = dayjs(date).add(timeBetweenStartAndEnd, 'millisecond');

                    let eventAttendeeObject = {
                      scheduleID: attendee.scheduleID,
                      attendeeID: attendee._id,
                      startDateTime: date.toISOString(),
                      endDateTime: endDateTime.toISOString(),
                      untilDateTime: attendee.untilDateTime
                    };
                    eventInstance.attendees.push(eventAttendeeObject);

                    eventExceptions.forEach(function (eventAttendeeException) {
                      if (
                        eventAttendeeException.eventID == event._id.toString() &&
                        new Date(eventAttendeeException.startDateTime).toISOString() == new Date(date).toISOString()
                        //TODO:Something Odd is going on with exceptions on attendees
                        //TODO:Exception until Date does not seem to work
                        //TODO:Events with Different Start and End Dates do not display correctly (hasn't been implemented)
                      ) {
                        eventAttendeeObject.status = 'cancelled';
                        eventAttendeeObject.exception = eventAttendeeException._id;
                      }
                    });
                  }
                }
              }
            });
            refinedEvents.push(eventInstance);
          }
        } else {
          if (event.endDateTime >= new Date(rangeStartDateTime) && event.startDateTime <= new Date(rangeEndDateTime)) {
            let eventInstance = {
              _id: event._id,
              isInstance: false,

              scheduleID: event.scheduleID,
              title: event.title,
              description: event.description,
              location: event.location,
              timeZone: event.timeZone,
              startDateTime: event.startDateTime, //adjust for new date
              endDateTime: event.endDateTime, //adjust for new date
              maxAttendees: event.maxAttendees,

              attendees: []
            };

            attendees.forEach(function (attendee) {
              //TODO: No attendee date validation
              if (attendee.eventID.toString() == event._id.toString()) {
                let eventAttendeeObject = {
                  scheduleID: attendee.scheduleID,
                  attendeeID: attendee._id,
                  startDateTime: attendee.startDateTime,
                  endDateTime: attendee.endDateTime,
                  untilDateTime: attendee.untilDateTime
                };
                eventInstance.attendees.push(eventAttendeeObject);
              }
            });

            refinedEvents.push(eventInstance);
          }
        }
      }

      for (let attendeeEvent of attendingEvents) {
        if (attendeeEvent.recurrenceRule) {
          let dates = this.findInstancesInRange(attendeeEvent.startDateTime, attendeeEvent.endDateTime, attendeeEvent.recurrenceRule, rangeStartDateTime, rangeEndDateTime);

          for (let date of dates) {
            let startDateTimeTemp = dayjs(attendeeEvent.startDateTime);
            let endDateTimeTemp = dayjs(attendeeEvent.endDateTime);
            let timeBetweenStartAndEnd = endDateTimeTemp.diff(startDateTimeTemp);

            let endDateTime = dayjs(date).add(timeBetweenStartAndEnd, 'millisecond');
            let attendeeEventInstance = {
              _id: attendeeEvent._id,
              isInstance: true,
              isAttending: true,

              scheduleID: attendeeEvent.scheduleID,
              title: attendeeEvent.title,
              description: attendeeEvent.description,
              location: attendeeEvent.location,
              timeZone: attendeeEvent.timeZone,
              startDateTime: date.toISOString(), //adjust for new date
              endDateTime: endDateTime.toISOString(), //adjust for new date
              recurrenceRule: attendeeEvent.recurrenceRule,
              maxAttendees: attendeeEvent.maxAttendees,

              attendees: []
            };

            eventExceptions.forEach(function (eventException) {
              if (
                eventException.eventID == attendeeEvent._id.toString() &&
                new Date(eventException.startDateTime).toISOString() == new Date(date).toISOString()
                //TODO:Something Odd is going on with exceptions on attendees
              ) {
                attendeeEventInstance.status = 'cancelled';
                attendeeEventInstance.exception = eventException._id;
              }
            });
            refinedEvents.push(attendeeEventInstance);
          }
        } else {
          let attendeeEventInstance = {
            _id: attendeeEvent._id,
            isAttending: true,

            scheduleID: attendeeEvent.scheduleID,
            title: attendeeEvent.title,
            description: attendeeEvent.description,
            location: attendeeEvent.location,
            timeZone: attendeeEvent.timeZone,
            startDateTime: attendeeEvent.startDateTime,
            endDateTime: attendeeEvent.endDateTime,
            maxAttendees: attendeeEvent.maxAttendees
          };
          refinedEvents.push(attendeeEventInstance);
        }
      }
      return refinedEvents;
    }
  }
};
</script>
