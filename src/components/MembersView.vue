<template>
  <div class="text-overline mb-4"><span class="bebas-neue-regular" style="font-size: 1rem;">Members</span></div>

  <a-card a-for="member in members" :key="member._id" class="mb-4" @click="console.log('test')">
    <a-card-item>
      <a-card-title>
        {{ users[member.userID].name }}
      </a-card-title>
      <a-card-subtitle>
        {{ roles[member.clumpID].title }}
      </a-card-subtitle>
    </a-card-item>
  </a-card>
</template>

<script setup>
//
</script>

<script>
export default {
  mounted() {
    this.getMembers();
  },
  data() {
    return {
      users: {},
      members: [],
      roles: {},
    }
  },

  methods: {
    getMembers() {
      fetch('/api/v1/members', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          this.members = data.data.members;
          this.users = data.data.users;
          this.roles = data.data.roles;
        })
      })
    }
  }
}
</script>