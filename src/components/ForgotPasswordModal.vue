<template>
  <a-modal :open="visible" @cancel="close()" title="Request Password Reset Token">
    <template #footer> </template>
    <div class="mb-2">
      Email
      <a-input class="mb-2" size="large" id="email" v-model:value="email"></a-input>
    </div>
    <a-flex justify="space-around" align="middle" gap="middle">
      <a-button type="primary" size="large" block @click="requestPasswordResetToken()">Request Reset Token</a-button>
    </a-flex>
  </a-modal>
</template>

<script setup></script>

<script>
import { Button, Input, Flex, Modal } from 'ant-design-vue';

export default {
  components: {
    AButton: Button,
    AInput: Input,
    AFlex: Flex,
    AModal: Modal
  },
  props: ['visible'],
  emits: ['close'],
  data() {
    return {
      email: ''
    };
  },
  methods: {
    requestPasswordResetToken() {
      fetch('/api/v1/users/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email
        })
      }).then((response) => {
        if (response.status == 200) {
          alert('Check Your Email');
        } else {
          alert('Incorrect');
        }
      });
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>
