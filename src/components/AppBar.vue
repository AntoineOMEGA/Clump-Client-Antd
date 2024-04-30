<template>
  <a-page-header class="header mb-2" v-if="!noAppBarPages.includes($route.name)">
    <a-typography-title :level="3">Clump</a-typography-title>
  </a-page-header>
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

<style scoped>
.header {
  height: 70px;
  padding: 5px;
  text-align: center;
}
</style>