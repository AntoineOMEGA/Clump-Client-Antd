<template>
  <a-row>
    <a-col>
      <a-form>
        <a-input id="name" placeholder="Name" v-model="name"></a-input>
        <a-input id="email" placeholder="Email" v-model="email"></a-input>
        <a-input id="password" placeholder="Password" type="password" v-model="password"></a-input>
        <a-input id="passwordConfirm" placeholder="Confirm Password" type="password"
          v-model="passwordConfirm"></a-input>
        <a-button type="primary" size="large" @click="signup()" block>Sign Up</a-button>
      </a-form>
      <a-row>
        <a-col>
          <RouterLink to="/login">Login</RouterLink>
        </a-col>
      </a-row>
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
