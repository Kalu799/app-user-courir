<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useSaisonsStore } from '@/stores/saisons'
import { useProgressStore } from '@/stores/progress'

const authStore = useAuthStore()
const saisonsStore = useSaisonsStore()
const progressStore = useProgressStore()

const router = useRouter()

const showResetOptions = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  if (saisonsStore.saisons.length === 0) {
    await saisonsStore.getSaisons()
  }
})

const confirmResetWeek = async () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment recommencer cette semaine ?'
  )

  if (!confirmed) return

  errorMessage.value = ''

  const reset = await progressStore.resetWeek(
    saisonsStore.currentSaison
  )

  if (!reset) {
    errorMessage.value = progressStore.errorMessage
    return
  }

  showResetOptions.value = false
}

const confirmResetSaison = async () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment recommencer tout le programme ? Toute votre progression sera réinitialisée.'
  )

  if (!confirmed) return

  errorMessage.value = ''

  const reset = await progressStore.resetSaison(
    saisonsStore.currentSaison
  )

  if (!reset) {
    errorMessage.value = progressStore.errorMessage
    return
  }

  progressStore.hasStartedSaison = false
  showResetOptions.value = false
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
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

      <br><br>

      <div class="profile-progress">
        <p v-if="errorMessage" class="profile-error">
          {{ errorMessage }}
        </p>

        <button class="profile-progress__toggle" @click="showResetOptions = !showResetOptions">
          Gérer ma progression
        </button>

        <div v-if="showResetOptions" class="profile-progress__actions">
          <button class="profile-progress__btn" @click="confirmResetWeek">
            Recommencer la semaine
          </button>

          <button class="profile-progress__btn profile-progress__btn--danger" @click="confirmResetSaison">
            Recommencer le programme
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.profile-screen {
  min-height: 100%;
  padding: 20px 14px 40px;

  background-color: #f7f8f5;
  color: #022c4d;
}

.profile-card {
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;

  margin: 0 auto;
  padding: 24px 20px;

  background-color: #ffffff;

  border-radius: 20px;

  box-shadow:
    0 2px 8px rgb(2 44 77 / 6%),
    0 12px 32px rgb(2 44 77 / 8%);
}

.profile-card h1 {
  margin: 0 0 24px;

  color: #022c4d;

  font-size: 1.8rem;
  font-weight: 800;
}


/* USER */

.profile-info {
  margin-bottom: 24px;
  padding: 16px;

  border-radius: 14px;

  background-color: #f2f6ed;
}

.profile-info p {
  margin: 0 0 4px;

  color: #66757f;

  font-size: 0.85rem;
}

.profile-info strong {
  color: #022c4d;

  font-size: 1.2rem;
  font-weight: 800;
}


/* PROGRAMME */

.profile-program {
  margin-bottom: 28px;
  padding: 18px;

  border: 1px solid rgb(2 44 77 / 8%);
  border-radius: 14px;
}

.profile-program p {
  margin: 0 0 8px;

  color: #374955;

  font-size: 0.95rem;
  line-height: 1.4;
}

.profile-program p:last-child {
  margin-bottom: 0;
}


/* GESTION PROGRESSION */

.profile-progress {
  margin-bottom: 32px;
}

.profile-error {
  margin: 0 0 12px;
  padding: 12px 14px;

  border-radius: 12px;

  background-color: rgb(180 59 59 / 8%);
  color: #b43b3b;
  font-size: 0.9rem;
  font-weight: 700;
}

.profile-progress__toggle {
  width: 100%;
  min-height: 50px;

  padding: 12px 16px;

  border: 1px solid #d6dde1;
  border-radius: 12px;

  background-color: #ffffff;
  color: #022c4d;

  font: inherit;
  font-weight: 700;

  cursor: pointer;
}

.profile-progress__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 12px;
}

.profile-progress__btn {
  width: 100%;
  min-height: 48px;

  padding: 12px 16px;

  border: 1px solid #d6dde1;
  border-radius: 12px;

  background-color: #f7f8f5;
  color: #022c4d;

  font: inherit;
  font-weight: 600;

  cursor: pointer;
}

.profile-progress__btn:active,
.profile-progress__toggle:active {
  transform: scale(0.98);
}

.profile-progress__btn--danger {
  border-color: #d95c5c;

  background-color: #ffffff;
  color: #b43b3b;
}


/* LOGOUT */

.logout-btn {
  width: 100%;
  min-height: 54px;

  padding: 14px 18px;

  border: none;
  border-radius: 14px;

  background-color: #022c4d;
  color: #ffffff;

  font: inherit;
  font-size: 1rem;
  font-weight: 800;

  cursor: pointer;
}

.logout-btn:active {
  transform: scale(0.98);
}


/* DESKTOP */

@media (min-width: 600px) {
  .profile-screen {
    padding-top: 40px;
  }

  .profile-card {
    padding: 30px;
  }
}
</style>
