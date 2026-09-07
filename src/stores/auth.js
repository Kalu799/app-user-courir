import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (login, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login,
          password,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Identifiants incorrects')
    }

    const data = await response.json()

    token.value = data.token
    user.value = data.user

    localStorage.setItem('token', data.token)
  }

  const logout = () => {
    token.value = null
    user.value = null

    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})