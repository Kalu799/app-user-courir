import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useProgressStore } from './progress'

export const useSaisonsStore = defineStore('saisons', () => {

  const progressStore = useProgressStore()

  const saisons = ref([])

  const getSaisons = async () => {
    await fetch('http://localhost:3000/api/saisons')
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

  return {
    saisons,
    currentSaison,
    currentWeek,
    currentDay,
    getSaisons,
  }
})