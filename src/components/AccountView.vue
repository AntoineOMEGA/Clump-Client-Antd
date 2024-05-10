<template>
  <div style="margin: 20px">
    <a-typography-title :level="1">My Account</a-typography-title>
    <a-form>
      <div class="mb-2">
        Name
        <a-input size="large" v-model:value="accountFormData.name"></a-input>
      </div>

      <div class="mb-2">
        Email
        <a-input size="large" v-model:value="accountFormData.email"></a-input>
      </div>

      <div class="mb-2">
        Password
        <a-input size="large" type="password" v-model:value="accountFormData.password"></a-input>
      </div>

      <div class="mb-2">
        Confirm Password
        <a-input size="large" type="password" v-model:value="accountFormData.confirmPassword"></a-input>
      </div>

      <a-alert message="Error" :description="accountFormErrorMessage" type="error" class="mb-2" v-if="accountFormErrorMessage != ''" />

      <a-flex justify="space-around" align="middle" gap="middle">
        <a-button type="primary" size="large" block @click="updateAccount()">Save</a-button>
        <a-button type="primary" size="large" block danger @click="deleteAccount()">Delete</a-button>
      </a-flex>
    </a-form>
  </div>
</template>

<script setup></script>

<script>
export default {
  data() {
    return {
      accountFormData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      accountFormErrorMessage: ''
    };
  }
};
</script>
