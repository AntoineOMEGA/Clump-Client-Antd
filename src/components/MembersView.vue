<template>
  <div>
    <a-card v-for="member in members" :key="member._id" style="margin: 10px" :title="member.name" :bodyStyle="{ padding: '0' }">
      {{ roles[member.clumpID].title }}
      <template #extra>
        <EditOutlined style="font-size: 1.5rem" key="edit" @click="exampleViewOpen = !exampleViewOpen" />
      </template>
    </a-card>
  </div>
</template>

<script setup>
import { EditOutlined } from '@ant-design/icons-vue';
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
      roles: {}
    };
  },

  methods: {
    getMembers() {
      fetch('/api/v1/members', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          this.members = data.data.members;
          this.users = data.data.users;
          this.roles = data.data.roles;
        });
      });
    }
  }
};
</script>
