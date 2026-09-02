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

  const resetSaison = () => {
    currentDayId.value = 'saison1-semaine1-jour1'
  }

  const resetWeek = (saison) => {
    //console.log(saison)

    // récup de la semaine en cours
    const currentWeek = saison.semaines.find(week => week.jours.some(day => day.id === currentDayId.value)) ?? null
    // sécu si pas de currentWeek -> on stop
    if(!currentWeek) return

    // récup du 1er jour de la semaine
    const firstDay = currentWeek.jours[0]
    // sécu si pas de firstDay -> on stop
    if(!firstDay) return

    // change l'id du jour en cours par celui du 1er jour de la semaine en cours
    currentDayId.value = firstDay.id
  }

  return {
    currentDayId,
    goToNextDay,
    resetSaison,
    resetWeek,
  }
})