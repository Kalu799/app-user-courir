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

  const currentDay = computed(() => {
    const saison = saisons.value[0]
    if (!saison) return null

    const allDays = saison.semaines.flatMap(semaine => semaine.jours)

    return allDays.find(day => day.id === progressStore.currentDayId) ?? null
  })

  const currentWeek = computed(() => {
    const saison = saisons.value[0]
    if (!saison || !currentDay.value) return null

    return saison.semaines.find(week => week.jours.some(day => day.id === currentDay.value.id)) ?? null
  })

  return {
    saisons,
    getSaisons,
    currentDay,
    currentWeek
  }
})