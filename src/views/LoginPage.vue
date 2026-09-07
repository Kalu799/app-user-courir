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

      <form class="auth-form" @submit.prevent="submitLogin">
        <label class="auth-field">
          <span>Login</span>

          <input v-model="login" type="text" required>
        </label>

        <label class="auth-field">
          <span>Mot de passe</span>

          <input v-model="password" type="password" required>
        </label>

        <p v-if="errorMessage" class="auth-message auth-message--error">
          {{ errorMessage }}
        </p>

        <button class="auth-submit" type="submit">
          Se connecter
        </button>
      </form>

      <RouterLink to="/register" class="auth-link">
        Créer un compte
      </RouterLink>
    </div>
  </section>
</template>


<style scoped>
.auth-screen {
  min-height: 100%;
  padding: 24px 16px 40px;

  background-color: #f7f8f5;
  color: #022c4d;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;

  margin: 0 auto;
  padding: 28px 20px;

  background-color: #ffffff;

  border-radius: 20px;

  box-shadow:
    0 2px 8px rgb(2 44 77 / 6%),
    0 12px 32px rgb(2 44 77 / 8%);
}

.auth-card h1 {
  margin: 0 0 28px;

  color: #022c4d;

  font-size: 1.8rem;
  font-weight: 800;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 7px;

  color: #374955;

  font-size: 0.9rem;
  font-weight: 700;
}

.auth-field input {
  width: 100%;
  box-sizing: border-box;

  min-height: 50px;

  padding: 12px 14px;

  border: 1px solid #d6dde1;
  border-radius: 12px;

  background-color: #ffffff;
  color: #022c4d;

  font: inherit;
  font-size: 1rem;
}

.auth-field input:focus {
  outline: 3px solid rgb(133 188 36 / 20%);
  border-color: #85bc24;
}

.auth-submit {
  width: 100%;
  min-height: 56px;

  margin-top: 6px;
  padding: 14px 18px;

  border: none;
  border-radius: 14px;

  background-color: #85bc24;
  color: #ffffff;

  font: inherit;
  font-size: 1rem;
  font-weight: 800;

  cursor: pointer;
}

.auth-submit:active {
  transform: scale(0.98);
}

.auth-link {
  display: block;

  margin-top: 22px;

  color: #022c4d;

  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.auth-message {
  margin: 0;
  padding: 12px 14px;

  border-radius: 10px;

  font-size: 0.9rem;
  line-height: 1.4;
}

.auth-message--error {
  background-color: rgb(180 59 59 / 8%);
  color: #b43b3b;
}

.auth-message--success {
  background-color: rgb(133 188 36 / 12%);
  color: #496c0e;
}

@media (min-width: 600px) {
  .auth-screen {
    padding-top: 48px;
  }

  .auth-card {
    padding: 32px;
  }
}
</style>