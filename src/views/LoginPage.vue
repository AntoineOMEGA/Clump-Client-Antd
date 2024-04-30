<template>
  <a-row>
    <a-col>
      <a-form>
        <a-input id="email" placeholder="Email" v-model="email"></a-input>
        <a-input id="password" placeholder="Password" type="password" v-model="password"></a-input>
        <a-button type="primary" size="large" @click="login()" block>Login</a-button>
      </a-form>
      <a-space>
        <a-row>
          <a-col>
            <RouterLink to="/forgot-password">Forgot Password?</RouterLink>
          </a-col>
          <a-col>
            <RouterLink to="/signup">Sign Up</RouterLink>
          </a-col>
        </a-row>
      </a-space>
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