import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useProgressStore } from './progress'

export const useSaisonsStore = defineStore('saisons', () => {

  const progressStore = useProgressStore()

  const saisons = ref([])

  const getSaisons = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/saisons`)
    .then(res => res.json())
    .then((res) => { saisons.value = res })
    .catch(err => { console.log(err) })
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

  // petit résumé de la séance
  const currentDayDuration = computed(() => {
    if (!currentDay.value) return 0

    return currentDay.value.exercices.reduce(
      (total, exercice) => total + exercice.dureeMinutes,
      0
    )
  })

  return {
    saisons,
    currentSaison,
    currentWeek,
    currentDay,
    currentDayDuration,
    getSaisons,
  }
})