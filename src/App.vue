<script setup>
import { RouterView } from 'vue-router';
import AppBar from './components/AppBar.vue';
</script>

<script>
import { ConfigProvider, Layout } from 'ant-design-vue';
export default {
  components: {
    AConfigProvider: ConfigProvider,
    ALayout: Layout
  }
}
</script>

<template>
  <a-config-provider :theme="{
    token: {
      colorBgBase: '#252525',
      colorTextBase: '#ffffff',
      colorPrimary: '#22a2ff',
      colorPrimaryBg: '#22a2ff',
      colorLink: '#22a2ff',
      colorBorder: '#444444'
    },
    components: {
      Alert: {
        colorText: '#000000'
      }
    }
  }">
    <a-layout class="full-height">
      <AppBar />
      <RouterView />
    </a-layout>
  </a-config-provider>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
}

.full-height {
  height: 100vh;
  overflow: auto;
}

.mb-2 {
  margin-bottom: 20px;
}

button {
  box-shadow: none !important;
}
</style>
