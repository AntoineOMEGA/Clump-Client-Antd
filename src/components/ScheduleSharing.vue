<template>
  <a-drawer :open="visible" @close="close()">
    <a-spin :spinning="scheduleLinksLoading">
      <a-tabs>
        <a-tab-pane key="Internal" tab="Internal">
          <template>
            <a-collapse>
              <a-collapse-panel key=""> </a-collapse-panel>
            </a-collapse>
          </template>
        </a-tab-pane>

        <a-tab-pane key="External" tab="External">
          <template v-for="scheduleLink in scheduleLinks.sort((a, b) => (a.recipient >= b.recipient ? 1 : -1))"
            :key="scheduleLink._id">
            <a-card style="margin-bottom: 10px" :title="scheduleLink.recipient" :bodyStyle="{ padding: '0' }">
              <template #extra>
                <CopyOutlined style="font-size: 1.5rem; margin-right: 15px" key="copy"
                  @click="copyLink(scheduleLink)" />
                <UserDeleteOutlined style="font-size: 1.5rem" key="delete"
                  @click="deleteScheduleLink(scheduleLink._id)" />
              </template>
            </a-card>
          </template>
          <a-input type="email" placeholder="Email" v-model:value="newScheduleLinkRecipient" />
          <a-button type="primary" style="margin: 10px" @click="createScheduleLink()">Send Link</a-button>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-drawer>
</template>

<script setup>
import { UserDeleteOutlined, CopyOutlined } from '@ant-design/icons-vue';
</script>

<script>
import { Button, Drawer, Spin, Card, Input, Tabs, TabPane, Collapse, CollapsePanel } from 'ant-design-vue';

export default {
  components: {
    AButton: Button,
    ADrawer: Drawer,
    ASpin: Spin,
    ACard: Card,
    AInput: Input,
    ATabs: Tabs,
    ATabPane: TabPane,
    ACollapse: Collapse,
    ACollapsePanel: CollapsePanel
  },
  props: ['visible', 'scheduleID'],
  emits: ['close'],
  updated() {
    if (this.visible) {
      this.getScheduleLinks(this.scheduleID);
    }
  },
  data() {
    return {
      scheduleLinksLoading: false,
      scheduleLinks: [],
      newScheduleLinkRecipient: ''
    };
  },
  methods: {
    getScheduleLinks() {
      fetch(`/api/v1/schedules/${this.scheduleID}/scheduleLinks`, {
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
          recipient: this.newScheduleLinkRecipient
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.scheduleLinks.push(data.data.scheduleLinks);
            this.newScheduleLinkRecipient = '';
          } else {
            //this.scheduleFormErrorMessage = data.message;
          }
        });
      });
    },
    configureScheduleSharingForm(schedule) {
      this.getScheduleLinks(schedule._id);
    },
    close() {
      this.$emit('close');
    },
    copyLink(scheduleLink) {
      navigator.clipboard.writeText(`webcal://clump.app/api/v1/schedules/${scheduleLink.scheduleID}/exportSchedule/${scheduleLink._id}`);
    }
  }
};
</script>
