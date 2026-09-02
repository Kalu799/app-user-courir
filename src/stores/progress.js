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

  const goToNextDay = (saison) => {
    const allDays = saison.semaines.flatMap(semaine => semaine.jours)

    const currentIndex = allDays.findIndex(
      day => day.id === currentDayId.value
    )

    const nextDay = allDays[currentIndex + 1]

    if (!nextDay) {
      hasStartedSaison.value = false
      return 'season-completed'
    }

    currentDayId.value = nextDay.id
    return 'day-completed'
  }

  const resetSaison = (saison) => {
    // récup 1ère semaine de la saison
    const firstWeek = saison.semaines[0]
    if (!firstWeek) return

    // récup du 1er jour de la semaine
    const firstDay = firstWeek.jours[0]
    if (!firstDay) return

    currentDayId.value = firstDay.id
  }

  const resetWeek = (saison) => {
    //console.log(saison)

    // récup de la semaine en cours
    const currentWeek = saison.semaines.find(week => week.jours.some(day => day.id === currentDayId.value)) ?? null
    // sécu si pas de currentWeek -> on stop
    if (!currentWeek) return

    // récup du 1er jour de la semaine
    const firstDay = currentWeek.jours[0]
    // sécu si pas de firstDay -> on stop
    if (!firstDay) return

    // change l'id du jour en cours par celui du 1er jour de la semaine en cours
    currentDayId.value = firstDay.id
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