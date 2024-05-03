<template>
  <template v-for="member in members" :key="member._id">
    <a-card :title="users[member.userID].name" class="mb-4">
      {{ roles[member.clumpID].title }}
    </a-card>
  </template>
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