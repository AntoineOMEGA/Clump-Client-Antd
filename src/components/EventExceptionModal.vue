<template>
  <a-modal :open="visible" title="Delete Exception" @cancel="close()">
    <template #footer>
      <a-button type="primary" @click="deleteEventException()">Delete</a-button>
    </template>
  </a-modal>
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
      fetch('/api/v1/event-exceptions/' + this.exception, {
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
