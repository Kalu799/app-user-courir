import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './auth'


export const useProgressStore = defineStore('progress', () => {
  const authStore = useAuthStore()

  const savedDayId = localStorage.getItem('currentDayId')

  const currentDayId = ref(savedDayId)

  watch(currentDayId, (newDayId) => {
    if (newDayId) {
      localStorage.setItem('currentDayId', newDayId)
      return
    }

    localStorage.removeItem('currentDayId')
  })

  const savedSaisonId = localStorage.getItem('currentSaisonId')
  const currentSaisonId = ref(savedSaisonId)

  watch(currentSaisonId, (newSaisonId) => {
    if (newSaisonId) {
      localStorage.setItem('currentSaisonId', newSaisonId)
      return
    }

    localStorage.removeItem('currentSaisonId')
  })

  const hasStartedSaison = ref(
    localStorage.getItem('hasStartedSaison') === 'true'
  )
  const errorMessage = ref('')

  watch(hasStartedSaison, (value) => {
    localStorage.setItem('hasStartedSaison', value)
  })

  const changeSaison = (saison) => {
    if (!saison?.semaines?.length) return

    currentSaisonId.value = saison.id

    const firstWeek = saison.semaines[0]
    if (!firstWeek) return

    const firstDay = firstWeek.jours[0]
    if (!firstDay) return

    currentDayId.value = firstDay.id
    hasStartedSaison.value = false
  }

  const initializeProgress = (saison) => {
    changeSaison(saison)
  }

  const saveProgress = async (currentSessionId) => {
    if (!authStore.token) return false

    errorMessage.value = ''

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me/progress`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            currentSessionId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('La progression n’a pas pu être enregistrée')
      }

      const data = await response.json()

      // Garder le profil Pinia aligné sur MySQL évite de restaurer une ancienne
      // séance quand le coureur revient immédiatement sur la page d’accueil.
      if (authStore.user) {
        authStore.user.currentSessionId = data.currentSessionId
      }

      return true
    }
    catch {
      errorMessage.value = 'La progression n’a pas pu être enregistrée. Réessayez.'
      return false
    }
  }

  const goToNextDay = async (saison) => {
    const allDays = saison.semaines.flatMap(semaine => semaine.jours)

    const currentIndex = allDays.findIndex(
      day => day.id === currentDayId.value
    )

    const nextDay = allDays[currentIndex + 1]

    if (!nextDay) {
      const saved = await saveProgress(null)

      if (!saved) return 'progress-error'

      hasStartedSaison.value = false

      return 'season-completed'
    }

    // On persiste d’abord : l’interface ne doit pas annoncer une nouvelle séance
    // si MySQL n’a pas accepté la mise à jour de current_session_id.
    const saved = await saveProgress(nextDay.id)

    if (!saved) return 'progress-error'

    currentDayId.value = nextDay.id

    return 'day-completed'
  }

  const resetSaison = async (saison) => {
    if (!saison?.semaines?.length) {
      errorMessage.value = 'Aucun programme disponible à réinitialiser.'
      return false
    }

    const firstWeek = saison.semaines[0]
    if (!firstWeek) return false

    const firstDay = firstWeek.jours[0]
    if (!firstDay) return false

    // Une saison réinitialisée ne doit plus verrouiller le choix de programme.
    // La prochaine séance ne sera enregistrée qu’au lancement du nouveau choix.
    const saved = await saveProgress(null)

    if (saved) {
      currentDayId.value = firstDay.id
    }

    return saved
  }

  const resetWeek = async (saison) => {
    if (!saison?.semaines?.length) {
      errorMessage.value = 'Aucun programme disponible à réinitialiser.'
      return false
    }

    const currentWeek = saison.semaines.find(
      week => week.jours.some(
        day => day.id === currentDayId.value
      )
    )

    if (!currentWeek) return false

    const firstDay = currentWeek.jours[0]
    if (!firstDay) return false

    const saved = await saveProgress(firstDay.id)

    if (saved) {
      currentDayId.value = firstDay.id
    }

    return saved
  }

  return {
    currentDayId,
    currentSaisonId,
    hasStartedSaison,
    errorMessage,
    changeSaison,
    initializeProgress,
    saveProgress,
    goToNextDay,
    resetSaison,
    resetWeek,
  }
})
