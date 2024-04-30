<script setup>
import { RouterView } from 'vue-router';
import { theme } from 'ant-design-vue';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons-vue';
</script>

<template>
  <a-config-provider :theme="{ algorithm: theme.darkAlgorithm }">
    <RouterView />
  </a-config-provider>
</template>