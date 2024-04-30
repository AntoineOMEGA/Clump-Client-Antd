<template>
  <a-row>
    <a-col></a-col>
    <a-col>
      <a-button type="primary" size="large" shape="round" class="mb-3"
        @click="clumpOverlayVisible = !clumpOverlayVisible" block>Create
        Clump</a-button>
      <a-button type="primary" size="large" shape="round" @click="clumpJoinOverlayVisible = !clumpJoinOverlayVisible"
        block>Join Clump</a-button>
    </a-col>
    <a-col></a-col>
  </a-row>
  <a-card v-for="clump in clumps" :key="clump._id" title="clump.title">
    {{ roles[clump._id].title }}
    <a-button @click="getClump(clump._id)">
      Enter
    </a-button>
    <a-button @click="configureClumpFormData(clump)">
      Edit
    </a-button>
  </a-card>

  <a-drawer v-model:open="clumpOverlayVisible">
    <a-form>
      <a-input placeholder="Title" v-model="clumpFormData.title"></a-input>

      <a-card v-if="clumpFormErrorMessage != ''" title="clumpFormErrorMessage">

      </a-card>

      <a-button type="primary" size="large" shape="round" @click="createClump()">
        Create Clump
      </a-button>
      <a-button type="primary" size="large" shape="round" v-if="clumpFormData._id" @click="updateClump()">
        Update Clump
      </a-button>
      <a-button type="primary" size="large" shape="round" v-if="clumpFormData._id" @click="deleteClump()">
        Delete Clump
      </a-button>
    </a-form>
  </a-drawer>

  <a-drawer v-model:open="clumpJoinOverlayVisible">
    <a-form>
      <a-input placeholder="Invite Token" v-model="clumpJoinFormData.inviteToken"></a-input>

      <a-card v-if="clumpJoinFormErrorMessage != ''" title="clumpJoinFormErrorMessage">
      </a-card>

      <a-button type="primary" size="large" shape="round" @click="joinClump()">
        Join Clump
      </a-button>
    </a-form>
  </a-drawer>
</template>

<script setup>
//
</script>

<script>
export default {
  mounted() {
    this.getClumps();
  },
  data() {
    return {
      clumpOverlayVisible: false,
      clumpJoinOverlayVisible: false,
      clumpFormData: {
        title: ''
      },
      clumpFormErrorMessage: '',
      clumpJoinFormData: {
        inviteToken: ''
      },
      clumpJoinFormErrorMessage: '',
      clumps: [],
      roles: {},
      members: {},
      toggle: undefined
    }
  },

  methods: {
    resetClumpFormData() {
      this.clumpOverlayVisible = false;
      this.clumpFormData = {
        title: ''
      }
      this.clumpFormErrorMessage - '';
    },
    resetClumpJoinFormData() {
      this.clumpJoinOverlayVisible = false;
      this.clumpJoinFormData = {
        inviteToken: ''
      }
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
          title: this.clumpFormData.title,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.clumpFormData.title = '';
            this.clumpOverlayVisible = false;
          } else {
            this.clumpFormErrorMessage = data.message;
          }
        })
      })
    },
    joinClump() {
      fetch('/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteToken: this.clumpJoinFormData.inviteToken,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 201) {
            this.clumpJoinFormData.title = '';
            this.clumpJoinOverlayVisible = false;
            this.getClumps();
          } else {
            this.clumpJoinFormErrorMessage = data.message;
          }
        })
      })
    },
    updateClump(clumpID) {
      fetch('/api/v1/clumps/' + clumpID, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.clumpFormData.title,
        })
      }).then(response => {
        response.json().then(data => {
          if (response.status === 200) {
            this.clumpFormData.title = '';
            this.clumpOverlayVisible = false;

            let indexOfUpdatedClump = this.clumps.findIndex(clump => clump._id === data.data.clump._id);
            this.clumps[indexOfUpdatedClump] = data.data.clump;
          } else {
            this.clumpFormErrorMessage = data.message;
          }
        })
      })
    },
    getClumps() {
      fetch('/api/v1/clumps', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          this.clumps = data.data.clumps;
          this.roles = data.data.roles;
          this.members = data.data.members;
        })
      })
    },
    leaveClump(memberID) {
      fetch('/api/v1/members/' + memberID, {
        method: 'DELETE',
      }).then(response => {
        response.json().then(data => {
          this.clumps = data.data.clumps;
          this.roles = data.data.roles;
        })
      })
    },
    getClump(clumpID) {
      fetch('/api/v1/clumps/' + clumpID, {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          console.log(data);
        })
      })
    },
  }
}
</script>