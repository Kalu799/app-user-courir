import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useProgressStore = defineStore('progress', () => {
  const savedDayId = localStorage.getItem('currentDayId')

  const currentDayId = ref(
    savedDayId ?? 'saison1-semaine1-jour1'
  )

  watch(currentDayId, (newDayId) => {
    localStorage.setItem('currentDayId', newDayId)
  })

  const goToNextDay = (saison) => {
    const allDays = saison.semaines.flatMap(semaine => semaine.jours)
    //console.log(allDays)

    const currentIndex = allDays.findIndex(day => day.id === currentDayId.value)
    //console.log(currentIndex)

    const nextDay = allDays[currentIndex + 1]
    //console.log(nextDay)

    if (nextDay) {
      currentDayId.value = nextDay.id
    }

    if (!nextDay) {
      console.log('Fin de la saison')
      return
    }
  }

  return {
    currentDayId,
    goToNextDay
  }
})