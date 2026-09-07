import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './auth'


export const useProgressStore = defineStore('progress', () => {
  const authStore = useAuthStore()

  const savedDayId = localStorage.getItem('currentDayId')

  const currentDayId = ref(
    savedDayId ?? 'saison1-semaine1-jour1'
  )

  watch(currentDayId, (newDayId) => {
    localStorage.setItem('currentDayId', newDayId)
  })

  const savedSaisonId = localStorage.getItem('currentSaisonId')
  const currentSaisonId = ref(savedSaisonId ?? 'saison1')

  watch(currentSaisonId, (newSaisonId) => {
    localStorage.setItem('currentSaisonId', newSaisonId)
  })

  const hasStartedSaison = ref(
    localStorage.getItem('hasStartedSaison') === 'true'
  )

  watch(hasStartedSaison, (value) => {
    localStorage.setItem('hasStartedSaison', value)
  })

  const changeSaison = (saison) => {
    currentSaisonId.value = saison.id

    const firstWeek = saison.semaines[0]
    if (!firstWeek) return

    const firstDay = firstWeek.jours[0]
    if (!firstDay) return

    currentDayId.value = firstDay.id
  }

  const saveProgress = async (currentSessionId) => {
    if (!authStore.token) return

    await fetch(
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
  }

  const goToNextDay = async (saison) => {
    const allDays = saison.semaines.flatMap(semaine => semaine.jours)

    const currentIndex = allDays.findIndex(
      day => day.id === currentDayId.value
    )

    const nextDay = allDays[currentIndex + 1]

    if (!nextDay) {
      hasStartedSaison.value = false

      await saveProgress(null)

      return 'season-completed'
    }

    currentDayId.value = nextDay.id

    await saveProgress(nextDay.id)

    return 'day-completed'
  }

  const resetSaison = async (saison) => {
    const firstWeek = saison.semaines[0]
    if (!firstWeek) return

    const firstDay = firstWeek.jours[0]
    if (!firstDay) return

    currentDayId.value = firstDay.id

    await saveProgress(firstDay.id)
  }

  const resetWeek = async (saison) => {
    const currentWeek = saison.semaines.find(
      week => week.jours.some(
        day => day.id === currentDayId.value
      )
    )

    if (!currentWeek) return

    const firstDay = currentWeek.jours[0]
    if (!firstDay) return

    currentDayId.value = firstDay.id

    await saveProgress(firstDay.id)
  }

  return {
    currentDayId,
    currentSaisonId,
    hasStartedSaison,
    changeSaison,
    goToNextDay,
    resetSaison,
    resetWeek,
  }
})