<template>
  <v-bottom-navigation class="bg-grey-darken-4" style="overflow-x: scroll" v-if="!noAppBarPages.includes($route.name)">
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
  </v-bottom-navigation>
</template>

<script setup>
//
</script>

<script>
export default {
  data() {
    return {
      noAppBarPages: ['Clump App', 'Login', 'Sign Up']
    }
  },

  methods: {

  }
}
</script>