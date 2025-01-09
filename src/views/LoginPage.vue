<template>
  <a-row class="full-height" span="24" justify="space-around" align="middle">
    <a-col :span="20">
      <a-typography-title>CLUMP</a-typography-title>
      <a-form>
        <a-input class="mb-2" size="large" id="email" addonBefore="Email" v-model:value="email"></a-input>
        <a-input class="mb-2" size="large" id="password" addonBefore="Password" type="password"
          v-model:value="password"></a-input>
        <a-button class="mb-2" type="primary" size="large" @click="login()" block>Login</a-button>
      </a-form>
      <a-flex justify="space-around" align="middle">
        <a @click="forgotPasswordModalVisible = true">Forgot Password?</a>
        <RouterLink to="/signup">Sign Up</RouterLink>
      </a-flex>
    </a-col>
  </a-row>

  <ForgotPasswordModal :visible="forgotPasswordModalVisible" @close="forgotPasswordModalVisible = false" />
</template>

<script setup>
import ForgotPasswordModal from '../components/ForgotPasswordModal.vue';
</script>

<script>
import { Row, Col, Button, Form, Input, Flex, TypographyTitle } from 'ant-design-vue';

export default {
  components: {
    ARow: Row,
    ACol: Col,
    AButton: Button,
    AForm: Form,
    AInput: Input,
    AFlex: Flex,
    ATypographyTitle: TypographyTitle
  },
  data() {
    return {
      email: '',
      password: '',
      forgotPasswordModalVisible: false
    };
  },

  methods: {
    login() {
      fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      }).then((response) => {
        if (response.status == 200) {
          this.$router.push('/clumps');
        } else {
          alert('Incorrect');
        }
      });
    }
  }
};
</script>
