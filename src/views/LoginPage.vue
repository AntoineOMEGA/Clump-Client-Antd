<template>
  <a-container class="fill-height">
    <a-row>
      <a-col>
        <a-form>
          <a-input id="email" label="Email" a-model="email"></a-input>
          <a-input id="password" label="Password" type="password" a-model="password"></a-input>
          <a-button @click="login()" size="x-large" color="light-blue" rounded="pill"
            style="height: 60px; font-size: 2rem;" class="bebas-neue-regular" block>Login</a-button>
        </a-form>
        <a-container>
          <a-row style="text-align: center;">
            <a-col>
              <a href="" class="text-light-blue-lighten-2">Forgot Password?</a>
            </a-col>
            <a-col>
              <RouterLink class="text-light-blue-lighten-2" to="/signup">Sign Up</RouterLink>
            </a-col>
          </a-row>
        </a-container>
      </a-col>
    </a-row>
  </a-container>
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
