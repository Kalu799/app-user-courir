<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useSaisonsStore } from '@/stores/saisons'

const authStore = useAuthStore()
const saisonsStore = useSaisonsStore()

const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (saisonsStore.saisons.length === 0) {
    await saisonsStore.getSaisons()
  }
})
</script>

<template>
  <section class="profile-screen">
    <div class="profile-card">

      <h1>Mon profil</h1>

      <div class="profile-info">
        <p>
          Connecté en tant que
        </p>

        <strong>
          {{ authStore.user?.login }}
        </strong>
      </div>

      <div v-if="saisonsStore.currentSaison" class="profile-program">
        <p>
          Programme : {{ saisonsStore.currentSaison.label }}
        </p>

        <p v-if="saisonsStore.currentWeek">
          Semaine {{ saisonsStore.currentWeek.numero }}
          / {{ saisonsStore.currentSaison.semaines.length }}
        </p>

        <p v-if="saisonsStore.currentDay">
          Prochaine séance : {{ saisonsStore.currentDay.label }}
        </p>
      </div>

      <button class="logout-btn" @click="logout">
        Se déconnecter
      </button>

    </div>
  </section>
</template>