<template>
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
      <a-timeline-item color="gray" v-for="day in 7" :key="day - 1">
        <a-typography-title :level="4">
          {{
            dayjs(selectedWeek)
              .day(day - 1)
              .format('dddd [-] MM/DD/YYYY')
          }}</a-typography-title>
        <a-spin :spinning="eventLoadSpinning">
          <div v-for="event in events.sort((a, b) => (a.startDateTime >= b.startDateTime ? 1 : -1))" :key="event._id">
            <a-card v-if="
              dayjs(event.startDateTime).format('MM/DD/YYYY') ==
              dayjs(selectedWeek)
                .day(day - 1)
                .format('MM/DD/YYYY')
            " :bodyStyle="{ padding: '15px' }" style="background-color: #333333; margin-bottom: 10px"
              @click="configureEventForm(event)">
              <a-flex justify="space-between">
                <a-card-meta :title="event.title">
                  <template #description>{{ dayjs(event.startDateTime).format('h:mm A') }} to
                    {{ dayjs(event.endDateTime).format('h:mm A') }}

                    <div style="padding: 5px; background-color: #333333"
                      v-if="attendees.length > 0 && event.title.includes('Shift')">
                      <a-tag v-for="attendee in attendees.sort()" style="font-size: 14px; margin: 5px" :key="attendee"
                        :bordered="false">
                        {{ attendee }}
                      </a-tag>
                    </div>
                  </template>
                </a-card-meta>
              </a-flex>
            </a-card>
          </div>
        </a-spin>
      </a-timeline-item>
    </a-timeline>

    <a-float-button type="primary" style="height: 60px; width: 60px"
      @click="eventEditOverlayVisible = !eventEditOverlayVisible">
      <template #icon>
        <PlusOutlined style="font-size: 20px" />
      </template>
    </a-float-button>
  </a-drawer>
</template>

<script setup>
import { PlusOutlined, CaretRightOutlined, CaretLeftOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
</script>

<script>
export default {
  mounted() { },
  data() {
    return {};
  },
  methods: {


  }
};
</script>
