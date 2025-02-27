<template>
  <a-float-button type="primary" @click="clumpOverlayVisible = !clumpOverlayVisible"
    style="height: 60px; width: 60px; right: 100px">
    <template #icon>
      <PlusOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <a-float-button type="primary" @click="clumpJoinOverlayVisible = !clumpJoinOverlayVisible"
    style="height: 60px; width: 60px">
    <template #icon>
      <EnterOutlined style="font-size: 20px" />
    </template>
  </a-float-button>

  <a-spin :spinning="clumpLoadSpinning">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="clump in clumps" :key="clump._id">
        <a-card style="margin: 10px">
          <a-card-meta :title="clump.title"></a-card-meta>
          <template #actions>
            <select-outlined style="font-size: 1.5rem" key="select" @click="getClump(clump._id)" />
            <edit-outlined style="font-size: 1.5rem" key="edit" @click="configureClumpFormData(clump)" />
          </template>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>

  <a-drawer v-model:open="clumpOverlayVisible" @close="resetClumpFormData()">
    <a-form>
      <div class="mb-2">
        Title
        <a-input size="large" v-model:value="clumpFormData.title"></a-input>
      </div>

      <a-card v-if="clumpFormErrorMessage != ''" title="clumpFormErrorMessage"> </a-card>

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block v-if="!clumpFormData._id" @click="createClump()"> Create Clump
        </a-button>
        <a-button type="primary" size="large" block v-if="clumpFormData._id" @click="updateClump()"> Update Clump
        </a-button>
        <a-button type="primary" size="large" block danger v-if="clumpFormData._id" @click="deleteClump()"> Delete Clump
        </a-button>
      </a-flex>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="clumpJoinOverlayVisible" @close="resetClumpJoinFormData()">
    <a-form>
      <div class="mb-2">
        Invite Token
        <a-input size="large" v-model:value="clumpJoinFormData.inviteToken"></a-input>
      </div>

      <a-card v-if="clumpJoinFormErrorMessage != ''" title="clumpJoinFormErrorMessage"> </a-card>

      <a-flex justify="space-around" align="middle">
        <a-button type="primary" size="large" @click="joinClump()"> Join Clump </a-button>
      </a-flex>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { SelectOutlined, EditOutlined, PlusOutlined, EnterOutlined } from '@ant-design/icons-vue';
</script>

<script>
import { Row, Col, Button, FloatButton, Drawer, Spin, Card, CardMeta, Form, Input, Flex } from 'ant-design-vue';

export default {
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    AFloatButton: FloatButton,
    ADrawer: Drawer,
    ASpin: Spin,
    ACard: Card,
    ACardMeta: CardMeta,
    AForm: Form,
    AInput: Input,
    AFlex: Flex
  },
  mounted() {
    this.getClumps();
  },
  data() {
    return {
      clumpOverlayVisible: false,
      clumpJoinOverlayVisible: false,
      clumpLoadSpinning: false,
      clumpFormData: {
        title: ''
      },
      clumpFormErrorMessage: '',
      clumpJoinFormData: {
        inviteToken: ''
      },
      clumpJoinFormErrorMessage: '',
      clumps: [
        { _id: 'red', title: 'red', inviteToken: 'red' },
        { _id: 'red', title: 'green', inviteToken: 'green' },
        { _id: 'red', title: 'red', inviteToken: 'red' },
        { _id: 'red', title: 'green', inviteToken: 'green' },
        { _id: 'red', title: 'red', inviteToken: 'red' },
        { _id: 'red', title: 'green', inviteToken: 'green' },
        { _id: 'red', title: 'red', inviteToken: 'red' },
        { _id: 'red', title: 'green', inviteToken: 'green' },
        { _id: 'red', title: 'red', inviteToken: 'red' },
        { _id: 'red', title: 'green', inviteToken: 'green' }
      ],
      members: {},
      toggle: undefined
    };
  },

  methods: {
    resetClumpFormData() {
      this.clumpOverlayVisible = false;
      this.clumpFormData = {
        title: ''
      };
      this.clumpFormErrorMessage - '';
    },
    resetClumpJoinFormData() {
      this.clumpJoinOverlayVisible = false;
      this.clumpJoinFormData = {
        inviteToken: ''
      };
      this.clumpJoinFormErrorMessage - '';
    },
    configureClumpFormData(clump) {
      this.clumpFormData.title = clump.title;
      this.clumpFormData._id = clump._id;

      this.clumpOverlayVisible = true;
    },
    createClump() {
      fetch('/api/v1/clumps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.clumpFormData.title
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.clumpFormData.title = '';
            this.clumpOverlayVisible = false;
          } else {
            this.clumpFormErrorMessage = data.message;
          }
        });
      });
    },
    joinClump() {
      fetch('/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteToken: this.clumpJoinFormData.inviteToken
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 201) {
            this.clumpJoinFormData.title = '';
            this.clumpJoinOverlayVisible = false;
            this.getClumps();
          } else {
            this.clumpJoinFormErrorMessage = data.message;
          }
        });
      });
    },
    updateClump(clumpID) {
      fetch('/api/v1/clumps/' + clumpID, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.clumpFormData.title
        })
      }).then((response) => {
        response.json().then((data) => {
          if (response.status === 200) {
            this.clumpFormData.title = '';
            this.clumpOverlayVisible = false;

            let indexOfUpdatedClump = this.clumps.findIndex((clump) => clump._id === data.data.clump._id);
            this.clumps[indexOfUpdatedClump] = data.data.clump;
          } else {
            this.clumpFormErrorMessage = data.message;
          }
        });
      });
    },
    getClumps() {
      fetch('/api/v1/clumps', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          this.clumps = data.data.clumps;
          this.members = data.data.members;
        });
      });
    },
    leaveClump(memberID) {
      fetch('/api/v1/members/' + memberID, {
        method: 'DELETE'
      }).then((response) => {
        response.json().then((data) => {
          this.clumps = data.data.clumps;
        });
      });
    },
    getClump(clumpID) {
      fetch('/api/v1/clumps/' + clumpID, {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          console.log(data);
        });
      });
    }
  }
};
</script>
