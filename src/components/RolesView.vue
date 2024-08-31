<template>
  <a-row>
    <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" v-for="role in roles" :key="role._id">
      <a-card style="margin: 10px" :title="role.title" :bodyStyle="{ padding: '0' }">
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
  mounted() {},
  data() {
    return {};
  },
  methods: {
    getRoles() {
      fetch('/api/v1/roles', {
        method: 'GET'
      }).then((response) => {
        response.json().then((data) => {
          this.roles = data.data.roles;
        });
      });
    },
    createRole() {
      fetch('/api/v1/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.roleFormData.title,
          canViewAssignments: this.roleFormData.canViewAssignments,
          canEditAssignments: this.roleFormData.canEditAssignments,
          canViewSchedules: this.roleFormData.canViewSchedules,
          canEditSchedules: this.roleFormData.canEditSchedules,
          canCreate: this.roleFormData.canCreate,
          parentRole: this.roleFormData.parentRole
        })
      }).then((response) => {
        response.json().then((data) => {
          this.roleEditOverlayVisible = false;
          this.roleFormData.title = '';
          this.roleFormData.canViewAssignments = [];
          this.roleFormData.canEditAssignments = [];
          this.roleFormData.canViewSchedules = [];
          this.roleFormData.canEditSchedules = [];
          this.roleFormData.canCreate = [];
          this.roleFormData.parentRole = '';
          this.getRoles();
        });
      });
    }
  }
};
</script>
