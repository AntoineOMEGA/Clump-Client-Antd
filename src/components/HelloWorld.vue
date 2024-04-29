<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})

import { ref } from "vue";

const alerts = ref(["success", "info", "warning", "error"]);
const message = ref("Click Me!");
</script>

<template>
   <div>
    <a-row>
      <a-col span="12">
        <div v-for="(alert, i) in alerts" :key="i">
          <a-alert
            :message="alert + ' message'"
            description="Lorem ipsum dolor sit amet."
            :type="alert"
          />
        </div>
      </a-col>
      <a-col span="12">
        <a-button type="primary" @click="message = 'Hello!'">
          {{ message }}
        </a-button>
        <a-skeleton avatar :paragraph="{ rows: 4 }" />
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
