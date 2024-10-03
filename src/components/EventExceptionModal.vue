<template>
  <a-popover :open="visible" title="Delete Exception" trigger="click">
    <template #content>
      <a-button type="primary" @click="deleteEventException()">Delete</a-button>
    </template>
  </a-popover>
</template>

<script>
export default {
  mounted() {},
  props: ['visible', 'exception'],
  emits: ['close'],
  updated() {},
  data() {
    return {
      errorMessage: ''
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    deleteEventException() {
      this.eventLoading = true;
      fetch('/api/v1/event-exceptions/' + this.exception._id, {
        method: 'DELETE'
      }).then((response) => {
        if (response.status === 204) {
          this.close();
        } else {
          response.json().then((data) => {
            this.errorMessage = data.message;
          });
        }
      });
    }
  }
};
</script>
