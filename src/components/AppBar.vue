<template>
  <a-page-header class="header mb-2" v-if="!noAppBarPages.includes($route.name)">
    <a-row :wrap="false">
      <a-col flex="none">
        <a-button type="text" size="large" @click="displayMenu = !displayMenu">
          <box-icon name="menu" color="white" type="solid"></box-icon>
        </a-button>
      </a-col>
      <a-col flex="auto">
        <a-typography-title :level="3" style="text-align: center">CLUMP</a-typography-title>
      </a-col>
    </a-row>
  </a-page-header>

  <a-drawer
    :open="displayMenu"
    placement="top"
    :closable="false"
    @close="displayMenu = !displayMenu"
  >
    <a-row :wrap="false">
      <a-col flex="none">
        <a-button type="text" size="large" @click="displayMenu = !displayMenu">
          <box-icon name="x" color="white" type="solid"></box-icon>
        </a-button>
      </a-col>
      <a-col flex="auto">
        <a-typography-title :level="3" style="text-align: center">CLUMP</a-typography-title>
      </a-col>
    </a-row>
    <a-collapse ghost expandIconPosition="end">
      <!--Clumps-->
      <a-collapse-panel key="1" header="Clumps" @click="console.log('Open')">
        <p>test</p>
      </a-collapse-panel>

      <a-collapse-panel key="2" header="Roles">
        <p>test</p>
      </a-collapse-panel>

      <a-collapse-panel key="3" header="Schedules">
        <p>test</p>
      </a-collapse-panel>
    </a-collapse>
  </a-drawer>

  <!--

  <a-flex justify="space-around" align="middle">
    <a-button type="text" size="large" to="/schedule" block> Viewer </a-button>
    <a-button type="text" size="large" to="/event-templates" block> Event Templates </a-button>
    <a-button type="text" size="large" to="/schedules" block> Schedules </a-button>
  </a-flex>

  <a-menu v-if="!noAppBarPages.includes($route.name)">
    <a-button to="/clumps">
      <v-icon size="large" icon="mdi-grass" />
    </a-button>
    <a-button to="/schedule">
      <v-icon size="large" icon="mdi-calendar-month" />
    </a-button>
    <a-button to="/roles">
      <v-icon size="large" link icon="mdi-shield-crown" />
    </a-button>
    <a-button to="/my-account">
      <v-icon size="large" icon="mdi-account-circle" />
    </a-button>
  </a-menu>

  <v-bottom-navigation
    style="position: fixed; bottom: 55px"
    class="bg-light-blue-darken-2 bebas-neue-regular"
  >
    <a-button block to="/members" style="font-size: 1rem"> Members </a-button>
    <a-button block to="/roles" style="font-size: 1rem"> Roles </a-button>
  </v-bottom-navigation>
  -->
</template>

<script setup>
import 'boxicons'
</script>

<script>
export default {
  data() {
    return {
      displayMenu: false,
      noAppBarPages: ['Clump App', 'Login', 'Sign Up']
    }
  },

  methods: {}
}
</script>

<style scoped>
.header {
  height: 70px;
  padding: 5px;
  text-align: center;
}
</style>
