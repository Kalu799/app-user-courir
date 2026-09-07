<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const login = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const submitRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login.value,
          password: password.value,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()

      throw new Error(
        error.statusMessage || 'Erreur lors de l’inscription'
      )
    }

    successMessage.value = 'Compte créé avec succès.'

    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }
  catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <section class="auth-screen">
    <div class="auth-card">
      <h1>Créer un compte</h1>

      <form @submit.prevent="submitRegister">
        <label>
          Login

          <input v-model="login" type="text" required>
        </label>

        <label>
          Mot de passe

          <input v-model="password" type="password" minlength="6" required>
        </label>

        <p v-if="errorMessage">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage">
          {{ successMessage }}
        </p>

        <button type="submit">
          Créer mon compte
        </button>
      </form>

      <RouterLink to="/login">
        J’ai déjà un compte
      </RouterLink>
    </div>
  </section>
</template>