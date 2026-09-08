import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (login, password) => {
    let response

    try {
      response = await fetch(
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
    }
    catch {
      throw new Error('Impossible de contacter le serveur')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      throw new Error(error?.statusMessage || 'Identifiants incorrects')
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

  const fetchMe = async () => {
    if (!token.value) return null

    // Un token sauvegardé peut expirer, être révoqué ou être inaccessible si
    // l’API est hors ligne. Dans tous les cas, il ne doit plus ouvrir les routes protégées.
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      )

      if (!response.ok) {
        logout()
        return null
      }

      user.value = await response.json()

      return user.value
    }
    catch {
      logout()
      return null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchMe,
  }
})
