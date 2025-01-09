<template>
  <a-layout-content>
    <ClumpsView></ClumpsView>
  </a-layout-content>
</template>

<script setup>
import ClumpsView from '../components/ClumpsView.vue';
</script>

<script>
import { LayoutContent } from 'ant-design-vue';

export default {
  components: {
    ALayoutContent: LayoutContent
  },
}
</script>