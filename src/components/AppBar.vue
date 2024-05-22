<template>
  <a-page-header class="header mb-2" v-if="!noAppBarPages.includes($route.name)">
    <a-row :wrap="false">
      <a-col flex="none">
        <a-button type="text" size="large" @click="displayMenu = !displayMenu"> Menu </a-button>
      </a-col>
      <a-col flex="auto">
        <a-typography-title :level="3" style="text-align: center">CLUMP</a-typography-title>
      </a-col>
    </a-row>
  </a-page-header>

  <a-drawer :open="displayMenu" placement="top" :closable="false" @close="displayMenu = !displayMenu" :height="windowHeight">
    <a-row :wrap="false">
      <a-col flex="none">
        <a-button type="text" size="large" @click="displayMenu = !displayMenu"> Close </a-button>
      </a-col>
      <a-col flex="auto">
        <a-typography-title :level="3" style="text-align: center">CLUMP</a-typography-title>
      </a-col>
    </a-row>
    <a-menu mode="inline" style="border: none">
      <a-sub-menu title="Calendars">
        <a-menu-item
          @click="
            $router.push('/schedules');
            displayMenu = !displayMenu;
          "
          key="schedules"
          >Schedules</a-menu-item
        >
        <a-menu-item
          @click="
            $router.push('/event-templates');
            displayMenu = !displayMenu;
          "
          key="event-templates"
          >Event Templates</a-menu-item
        >
      </a-sub-menu>
      <a-menu-item
        @click="
          $router.push('/notes');
          displayMenu = !displayMenu;
        "
        key="notes"
      >
        Notes
      </a-menu-item>
      <a-menu-item
        @click="
          $router.push('/tags');
          displayMenu = !displayMenu;
        "
        key="tags"
      >
        Tags
      </a-menu-item>
      <a-sub-menu title="Permissions">
        <a-menu-item
          @click="
            $router.push('/members');
            displayMenu = !displayMenu;
          "
          key="members"
          >Members</a-menu-item
        >
        <a-menu-item
          @click="
            $router.push('/roles');
            displayMenu = !displayMenu;
          "
          key="roles"
          >Roles</a-menu-item
        >
      </a-sub-menu>
      <a-sub-menu title="Settings">
        <a-menu-item
          @click="
            $router.push('/clumps');
            displayMenu = !displayMenu;
          "
          key="clumps"
        >
          Clumps
        </a-menu-item>
        <a-menu-item
          @click="
            $router.push('/my-account');
            displayMenu = !displayMenu;
          "
          key="my-account"
        >
          My Account
        </a-menu-item>
      </a-sub-menu>
      <a-menu-item key="logout"> Logout </a-menu-item>
    </a-menu>
  </a-drawer>
</template>

<script setup></script>

<script>
export default {
  data() {
    return {
      displayMenu: false,
      noAppBarPages: ['Clump App', 'Login', 'Sign Up'],
      windowHeight: window.innerHeight
    };
  },

  methods: {}
};
</script>

<style scoped>
.header {
  height: 70px;
  padding: 5px;
  text-align: center;
}
</style>
