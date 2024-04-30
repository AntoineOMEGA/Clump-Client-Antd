<template>
  <a-row class="full-height" span="24" justify="space-around" align="middle">
    <a-col :span="20">
      <a-typography-title>CLUMP</a-typography-title>
      <a-form>
        <a-input class="mb-2" size="large" id="email" placeholder="Email" v-model="email"></a-input>
        <a-input class="mb-2" size="large" id="password" placeholder="Password" type="password"
          v-model="password"></a-input>
        <a-button class="mb-2" type="primary" size="large" @click="login()" block>Login</a-button>
      </a-form>
      <a-flex justify="space-around" align="middle">
        <RouterLink to="/forgot-password">Forgot Password?</RouterLink>
        <RouterLink to="/signup">Sign Up</RouterLink>
      </a-flex>
    </a-col>
  </a-row>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
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
      }).then(response => {
        if (response.status == 200) {
          this.$router.push('/clumps')
        } else {
          alert("Incorrect")
        }
      })
    }
  }
}
</script>