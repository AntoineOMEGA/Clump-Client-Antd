<template>
  <a-row class="full-height" span="24" justify="space-around" align="middle">
    <a-col :span="20">
      <a-typography-title>CLUMP</a-typography-title>
      <a-button type="primary" size="large" class="mb-2" block href="login">Login</a-button>
      <a-button type="primary" size="large" class="mb-2" block href="signup">Sign Up</a-button>
    </a-col>
  </a-row>
</template>

<script setup></script>

<script>
import { Row, Col, TypographyTitle, Button } from 'ant-design-vue';

export default {
  components: {
    ARow: Row,
    ACol: Col,
    ATypographyTitle: TypographyTitle,
    AButton: Button
  },
};
</script>