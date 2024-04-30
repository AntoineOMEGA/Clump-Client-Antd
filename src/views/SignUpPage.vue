<template>
  <a-layout class="fill-height">
    <a-row>
      <a-col>
        <a-form>
          <a-input id="name" label="Name" a-model="name"></a-input>
          <a-input id="email" label="Email" a-model="email"></a-input>
          <a-input id="password" label="Password" type="password" a-model="password"></a-input>
          <a-input id="passwordConfirm" label="Confirm Password" type="password" a-model="passwordConfirm"></a-input>
          <a-btn @click="signup()" size="x-large" rounded="pill" color="pink" style="height: 60px; font-size: 1.5rem;"
            class="bebas-neue-regular" block>Sign Up</a-btn>
        </a-form>
        <a-layout>
          <a-row style="text-align: center;">
            <a-col>
              <RouterLink class="text-pink-lighten-3" to="/login">Login</RouterLink>
            </a-col>
          </a-row>
        </a-layout>
      </a-col>
    </a-row>
  </a-layout>
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
