<template>
  <a-row class="full-height" span="24" justify="space-around" align="middle">
    <a-col :span="20">
      <a-typography-title>CLUMP</a-typography-title>
      <a-form>
        <a-input class="mb-2" size="large" id="name" placeholder="Name" v-model="name"></a-input>
        <a-input class="mb-2" size="large" id="email" placeholder="Email" v-model="email"></a-input>
        <a-input class="mb-2" size="large" id="password" placeholder="Password" type="password"
          v-model="password"></a-input>
        <a-input class="mb-2" size="large" id="passwordConfirm" placeholder="Confirm Password" type="password"
          v-model="passwordConfirm"></a-input>
        <a-button class="mb-2" type="primary" size="large" @click="signup()" block>Sign Up</a-button>
      </a-form>
      <a-flex justify="space-around" align="middle">
        <RouterLink to="/login">Login</RouterLink>
      </a-flex>
    </a-col>
  </a-row>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    }
  },

  methods: {
    signup() {
      fetch('/api/v1/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm
        })
      }).then(response => {
        if (response.status == 201) {
          this.$router.push('/clumps')
        } else {
          alert("Incorrect")
        }
      })
    }
  }
}
</script>
