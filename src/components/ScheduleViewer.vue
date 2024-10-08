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
                <template v-if="event.attendees">
                  <div class="attendee-count">
                    <span>{{ event.attendees.length }}/{{ event.maxAttendees }}</span>
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
      return this.events.sort((a, b) => (a.startDateTime >= b.startDateTime ? 1 : -1));
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
      this.getEventsOnSchedule();
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
    }
  }
};
</script>
