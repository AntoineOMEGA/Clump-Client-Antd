<template>
  <a-float-button type="primary" @click="scheduleEditorOverlayVisible = true" style="height: 60px; width: 60px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <div style="margin: 10px; margin-bottom: 15px">
    <a-input size="large" addonBefore="Search" v-model:value="scheduleFilterSettings.search"></a-input>
  </div>

  <a-spin :spinning="schedulesLoading">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6"
        v-for="schedule in schedules.sort((a, b) => (a.title >= b.title ? 1 : -1))" :key="schedule._id">
        <a-card v-if="schedule.title.toLowerCase().includes(scheduleFilterSettings.search.toLowerCase())"
          style="margin: 10px" :title="schedule.title" :bodyStyle="{ padding: '0' }">
          <template #extra>
            <CalendarOutlined style="font-size: 1.5rem; margin-right: 15px" key="calendar" @click="
              selectedSchedule = schedule;
            scheduleViewerOverlayVisible = true;
            " />
            <ShareAltOutlined style="font-size: 1.5rem; margin-right: 15px" key="share" @click="
              scheduleSharingOverlayVisible = true;
            selectedSchedule = schedule;
            " />
            <EditOutlined style="font-size: 1.5rem" key="edit" @click="
              scheduleEditorOverlayVisible = true;
            selectedSchedule = schedule;
            " />
          </template>
          <div style="padding: 10px; background-color: #333333" v-if="schedule.tagIDs.length > 0">
            <a-tag v-for="tagID in schedule.tagIDs" :key="tagID"
              :color="tags[tags.findIndex((tag) => tag._id === tagID)].color">
              {{ tags[tags.findIndex((tag) => tag._id === tagID)].title }}
            </a-tag>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>

  <ScheduleViewer :visible="scheduleViewerOverlayVisible" :schedule="selectedSchedule" @close="
    scheduleViewerOverlayVisible = false;
  selectedSchedule = {};
  " />
  <ScheduleSharing :visible="scheduleSharingOverlayVisible" :scheduleID="selectedSchedule._id"
    @close="scheduleSharingOverlayVisible = false" />
  <ScheduleEditor :visible="scheduleEditorOverlayVisible" :schedule="selectedSchedule" @close="
    scheduleEditorOverlayVisible = false;
  selectedSchedule = {};
  getSchedules();
  " />
</template>

<script setup>
import { PlusOutlined, EditOutlined, CalendarOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import ScheduleViewer from './ScheduleViewer.vue';
import ScheduleSharing from './ScheduleSharing.vue';
import ScheduleEditor from './ScheduleEditor.vue';
</script>

<script>
import { Row, Col, FloatButton, Spin, Card, Input, Tag } from 'ant-design-vue';

export default {
  components: {
    ARow: Row,
    ACol: Col,
    AFloatButton: FloatButton,
    ASpin: Spin,
    ACard: Card,
    AInput: Input,
    ATag: Tag
  },
  mounted() {
    this.getTags();
    this.getSchedules();
  },
  data() {
    return {
      schedulesLoading: false,
      schedules: [],
      tags: [],
      scheduleFilterSettings: {
        search: ''
      },

      scheduleViewerOverlayVisible: false,
      scheduleSharingOverlayVisible: false,
      scheduleEditorOverlayVisible: false,

      selectedSchedule: {}
    };
  },
  methods: {
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
    }
  }
};
</script>
