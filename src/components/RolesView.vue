<template>
  <div class="text-overline mb-4"><span class="bebas-neue-regular" style="font-size: 1rem;">Roles</span></div>

  <a-button color="white" icon rounded="pill" density="compact"
    @click="roleEditOverlayVisible = !roleEditOverlayVisible"
    style="position: fixed; bottom: 150px; right: 10px; z-index: 100; height: 60px; width: 60px;">
    <v-icon color="pink-accent-3" style="font-size: 3.5rem">mdi-plus-circle</v-icon>
  </a-button>

  <v-card v-for="role in roles" :key="role._id" class="mb-4" @click="console.log('test')">
    <v-card-item>
      <v-card-title>
        {{ role.title }}
      </v-card-title>
    </v-card-item>
  </v-card>

  <a-drawer v-model="roleEditOverlayVisible" class="justify-center bg-grey-darken-4" scrim="black" width="100%"
    style="overflow-y: scroll !important" persistent>
    <a-layout align="right">
      <a-button @click="roleEditOverlayVisible = !roleEditOverlayVisible" icon variant="text">
        <v-icon color="red-accent-3" size="x-large">mdi-close</v-icon>
      </a-button>
    </a-layout>
    <a-layout>

      <v-form>
        <v-input label="Title" v-model="roleFormData.title"></v-input>
        <v-select label="Can Create" v-model="roleFormData.canCreate" multiple></v-select>

        <span>Assignment Viewer</span>
        <v-select v-model="roleFormData.canViewAssignments" label="Can View Assignments" :items="assignments" multiple
          item-title="title" item-value="_id">
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw._id"></v-list-item>
          </template>
        </v-select>

        <v-select v-if="roleFormData.canViewAssignments.length > 0" v-model="roleFormData.canEditAssignments"
          label="Can Edit Assignments" :items="roleFormData.canViewAssignments" multiple item-title="title"
          item-value="_id"></v-select>

        <span>Schedule Viewer</span>
        <v-select v-model="roleFormData.canViewSchedules" label="Can View Schedules" :items="schedules"
          multiple></v-select>
        <v-select v-if="roleFormData.canViewSchedules.length > 0" v-model="roleFormData.canEditSchedules"
          label="Can Edit Assignments" :items="roleFormData.canViewSchedules" multiple></v-select>

        <span>Role Hierarchy</span>
        <v-select label="Parent" :items="roles"></v-select>
        <!--SHOULD ONLY SHOW FOR THOSE WITH VIEW, EDIT, & SHARE PERMISSIONS-->

        <div class="d-flex justify-space-between">
          <a-button size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill">Create</a-button>
          <a-button v-if="false" size="x-large" class="bg-light-blue bebas-neue-regular" rounded="pill">Save</a-button>
          <a-button size="x-large" class="bg-red-accent-3 bebas-neue-regular" rounded="pill">Delete</a-button>
        </div>
      </v-form>
    </a-layout>
  </a-drawer>
</template>

<script setup>

</script>

<script>
export default {
  mounted() {
    this.getRoles();
    this.getAssignments();
  },
  data() {
    return {
      roleEditOverlayVisible: false,
      roleFormData: {
        title: '',
        canViewAssignments: [],
        canEditAssignments: [],
        canViewSchedules: [],
        canEditSchedules: [],
        parentRole: '',
        canCreate: [],
        id: undefined,
      },
      roles: [],
      assignments: [],
      schedules: [],
    }
  },
  methods: {
    getRoles() {
      fetch('/api/v1/roles', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          this.roles = data.data.roles;
        })
      })
    },
    getAssignments() {
      fetch('/api/v1/assignments', {
        method: 'GET',
      }).then(response => {
        response.json().then(data => {
          this.assignments = data.data.assignments;
        })
      })
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
          parentRole: this.roleFormData.parentRole,
        })
      }).then(response => {
        response.json().then(data => {
          this.roleEditOverlayVisible = false;
          this.roleFormData.title = '';
          this.roleFormData.canViewAssignments = [];
          this.roleFormData.canEditAssignments = [];
          this.roleFormData.canViewSchedules = [];
          this.roleFormData.canEditSchedules = [];
          this.roleFormData.canCreate = [];
          this.roleFormData.parentRole = '';
          this.getRoles();
        })
      })
    },
  }
}
</script>