<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const login = ref('')
const password = ref('')
const errorMessage = ref('')

const submitLogin = async () => {
  errorMessage.value = ''

  try {
    await authStore.login(login.value, password.value)
    router.push('/')
  }
  catch {
    errorMessage.value = 'Login ou mot de passe incorrect'
  }
}
</script>

<template>
  <section class="auth-screen">
    <div class="auth-card">
      <h1>Connexion</h1>

      <form @submit.prevent="submitLogin">
        <label>
          Login
          <input v-model="login" type="text" required>
        </label>

        <label>
          Mot de passe
          <input v-model="password" type="password" required>
        </label>

        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>

        <button type="submit">
          Se connecter
        </button>
      </form>
    </div>
  </section>
  <RouterLink to="/register">Créer un compte</RouterLink>
</template>