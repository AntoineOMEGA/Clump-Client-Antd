<template>
  <a-row>
    <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="member in members" :key="member._id">
      <a-card style="margin: 10px" :title="member.name" :bodyStyle="{ padding: '0' }">
        {{ roles[member.clumpID].title }}
        <template #extra>
          <EditOutlined style="font-size: 1.5rem" key="edit" @click="exampleViewOpen = !exampleViewOpen" />
        </template>
      </a-card>
    </a-col>
  </a-row>
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
