<template>
  <v-app-bar color="light-blue-darken-4" v-if="!noAppBarPages.includes($route.name)">
    <v-app-bar-title style="text-align: center; font-size: 2rem;" class="bebas-neue-regular">Clump</v-app-bar-title>
  </v-app-bar>
</template>

<script setup>
//
</script>

<script>
export default {
  data() {
    return {
      noAppBarPages: ['Clump App']
    }
  },

  methods: {

  }
}
</script>