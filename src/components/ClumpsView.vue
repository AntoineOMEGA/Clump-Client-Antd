<template>
  <v-row no-gutters class="mb-4">
    <v-col></v-col>
    <v-col align-self="center">
      <v-btn-toggle v-model="toggle" rounded="pill" divided align-self="center" class="bebas-neue-regular">
        <v-btn class="bg-light-blue" size="x-large" @click="clumpOverlayVisible = !clumpOverlayVisible">Create
          Clump</v-btn>
        <v-btn class="bg-light-blue" size="x-large" @click="clumpJoinOverlayVisible = !clumpJoinOverlayVisible">Join
          Clump</v-btn>
      </v-btn-toggle>
    </v-col>
    <v-col></v-col>
  </v-row>
  <v-card v-for="clump in clumps" :key="clump._id" class="mb-4">
    <v-card-item>
      <v-card-title>
        {{ clump.title }}
      </v-card-title>
      <v-card-subtitle>
        {{ roles[clump._id].title }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-actions>
      <v-btn @click="getClump(clump._id)" icon variant="text">
        <v-icon>mdi-location-enter</v-icon>
      </v-btn>
      <v-btn @click="configureClumpFormData(clump)" icon variant="text">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-overlay v-model="clumpOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black" scroll-strategy="block"
    width="100%" style="overflow-y: scroll !important" persistent>
    <v-container align="right">
      <v-btn @click="resetClumpFormData()" icon variant="text">
        <v-icon color="red-accent-3">mdi-close</v-icon>
      </v-btn>
    </v-container>
    <v-container>

      <v-form>
        <v-text-field label="Title" v-model="clumpFormData.title"></v-text-field>

        <v-card class="bg-red-accent-3 mb-5" v-if="clumpFormErrorMessage != ''">
          <v-card-title>{{ clumpFormErrorMessage }}</v-card-title>
        </v-card>

        <v-btn class="mx-2 bg-light-blue bebas-neue-regular" size="x-large" rounded="pill" height="60px"
          @click="createClump()">
          Create Clump
        </v-btn>
        <v-btn v-if="clumpFormData._id" class="mx-2 bg-light-blue bebas-neue-regular" size="x-large" rounded="pill"
          height="60px" @click="updateClump()">
          Update Clump
        </v-btn>
        <v-btn v-if="clumpFormData._id" class="mx-2 bg-light-blue bebas-neue-regular" size="x-large" rounded="pill"
          height="60px" @click="deleteClump()">
          Delete Clump
        </v-btn>
      </v-form>
    </v-container>
  </v-overlay>

  <v-overlay v-model="clumpJoinOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black"
    scroll-strategy="block" width="100%" style="overflow-y: scroll !important" persistent>
    <v-container align="right">
      <v-btn @click="resetClumpJoinFormData()" icon variant="text">
        <v-icon color="red-accent-3" size="x-large">mdi-close</v-icon>
      </v-btn>
    </v-container>
    <v-container>

      <v-form>
        <v-text-field label="Invite Token" v-model="clumpJoinFormData.inviteToken"></v-text-field>

        <v-card class="bg-red-accent-3 mb-5" v-if="clumpJoinFormErrorMessage != ''">
          <v-card-title>{{ clumpJoinFormErrorMessage }}</v-card-title>
        </v-card>

        <v-btn class="mx-2 bg-light-blue bebas-neue-regular" size="x-large" rounded="pill" height="60px"
          @click="joinClump()">
          Join Clump
        </v-btn>
      </v-form>
    </v-container>
  </v-overlay>
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