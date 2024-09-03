<template>
  <a-drawer v-model:open="visible" @close="resetEventForm()">
    <a-spin :spinning="spinning">
      <template v-for="scheduleLink in scheduleLinks.sort((a, b) => (a.recipient >= b.recipient ? 1 : -1))" :key="scheduleLink._id">
        <a-card style="margin: 10px" :title="scheduleLink.recipient" :bodyStyle="{ padding: '0' }">
          <template #extra>
            <UserDeleteOutlined style="font-size: 1.5rem" key="delete" @click="deleteScheduleLink(scheduleLink._id)" />
          </template>
        </a-card>

        <a-button type="primary" style="margin: 10px" @click="recurrenceRuleModalVisible = true">Send Link</a-button>
      </template>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { UserDeleteOutlined } from '@ant-design/icons-vue';
</script>

<script>
export default {
  props: ['visible'],
  mounted() {},
  data() {
    return {
      spinning: false
    };
  },
  methods: {
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
    }
  }
};
</script>
