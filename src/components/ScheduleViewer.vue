<template>
  <a-drawer :open="visible" :bodyStyle="{ padding: '15px' }" @close="close()" :title="schedule.title">
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

    <a-spin :spinning="eventsLoading">
      <a-timeline>
        <a-timeline-item color="gray" v-for="day in 7" :key="day - 1">
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
              style="background-color: #333333; margin-bottom: 10px"
              @click="
                selectedEvent = event;
                eventEditOverlayVisible = true;
              "
            >
              <a-flex justify="space-between">
                <a-card-meta :title="event.title">
                  <template #description
                    >{{ dayjs(event.startDateTime).format('h:mm A') }} to
                    {{ dayjs(event.endDateTime).format('h:mm A') }}

                    <!-- <div style="padding: 5px; background-color: #333333" v-if="attendees.length > 0 && event.title.includes('Shift')">
                      <a-tag v-for="attendee in attendees.sort()" style="font-size: 14px; margin: 5px" :key="attendee" :bordered="false">
                        {{ attendee }}
                      </a-tag>
                    </div> -->
                  </template>
                </a-card-meta>
              </a-flex>
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
        getEventsOnSchedule();
      "
    />
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons-vue';
import EventEditor from './EventEditor.vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  props: ['visible', 'schedule'],
  emits: ['close'],
  updated() {
    if (this.visible) {
      this.getEventsOnSchedule();
    }
  },
  data() {
    return {
      selectedWeek: dayjs(),
      eventsLoading: false,
      events: [],

      eventEditOverlayVisible: false,
      selectedEvent: {}
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
    }
  }
};
</script>
