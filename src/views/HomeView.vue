<template>
  <main>
    <div class="auth-container">
      <h2>Login</h2>
      <label>
        <span>Email</span>
        <input
          ref="email"
          type="text"
        />
      </label>
      <label>
        <span>Password</span>
        <input
          ref="password"
          type="password"
        />
      </label>
      <button class="w-100" @click="login">
        Login
      </button>
    </div>
  </main>
</template>
<script lang="ts" setup>
import { auth } from "@/services/firebase";
import { signInWithEmailAndPassword  } from "firebase/auth";
import { ref, type Ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter()

const email: Ref<HTMLInputElement | undefined> = ref()
const password: Ref<HTMLInputElement | undefined> = ref()

const login = () => {
  if (!email.value || !password.value) {
    return
  }
  signInWithEmailAndPassword(auth, email.value.value, password.value.value)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log(user)
    router.push({name: 'games'})
  })
  .catch((error) => {
    console.error(error)
  });
}
</script>
<style lang="scss" scoped>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  .auth-container {
    background-color: var(--primary-color-dark);
    width: 400px;
    padding: 2rem;
    border-radius: 4px;
  }
}

</style>
