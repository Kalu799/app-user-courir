import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useProgressStore } from './progress'

export const useSaisonsStore = defineStore('saisons', () => {

  const progressStore = useProgressStore()

  const saisons = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  const getSaisons = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saisons`)

      if (!response.ok) {
        throw new Error('Impossible de récupérer les programmes')
      }

      const data = await response.json()
      saisons.value = Array.isArray(data) ? data : []

      // Sans préférence locale, proposer le premier programme sans encore le
      // considérer comme démarré : l'écriture serveur arrive au lancement.
      if (!currentSaison.value && saisons.value[0]) {
        progressStore.changeSaison(saisons.value[0])
      }
    }
    catch {
      saisons.value = []
      errorMessage.value = 'Impossible de récupérer les programmes.'
    }
    finally {
      loading.value = false
    }
  }

  const restoreCurrentSession = (sessionId) => {
    if (!sessionId) return false

    // current_session_id est sur l’utilisateur, alors que la saison sélectionnée
    // est un état local : on retrouve sa saison après une connexion ou un rechargement.
    for (const saison of saisons.value) {
      const day = saison.semaines
        ?.flatMap(semaine => semaine.jours)
        .find(item => item.id === sessionId)

      if (day) {
        progressStore.currentSaisonId = saison.id
        progressStore.currentDayId = day.id
        progressStore.hasStartedSaison = true
        return true
      }
    }

    return false
  }

  const currentSaison = computed(() => {
    return saisons.value.find(saison => saison.id === progressStore.currentSaisonId) ?? null
  })

  const currentDay = computed(() => {
    const saison = currentSaison.value
    if (!saison) return null

    const allDays = saison.semaines.flatMap(semaine => semaine.jours)

    return allDays.find(day => day.id === progressStore.currentDayId) ?? null
  })

  const currentWeek = computed(() => {
    const saison = currentSaison.value
    if (!saison || !currentDay.value) return null

    return saison.semaines.find(week => week.jours.some(day => day.id === currentDay.value.id)) ?? null
  })

  // Le résumé est dérivé des exercices pour rester juste si le CMS modifie une durée.
  const currentDayDuration = computed(() => {
    if (!currentDay.value) return 0

    return currentDay.value.exercices.reduce(
      (total, exercice) => total + Number(exercice.dureeMinutes),
      0
    )
  })

  return {
    saisons,
    loading,
    errorMessage,
    currentSaison,
    currentWeek,
    currentDay,
    currentDayDuration,
    getSaisons,
    restoreCurrentSession,
  }
})
