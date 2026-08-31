import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useProgressStore } from './progress'

export const useSessionStore = defineStore('session', () => {
  const progressStore = useProgressStore()

  const dayId = ref(null)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)
  let timerInterval = null

  const startSession = (day, saison) => {
    dayId.value = day.id
    //console.log(dayId.value)

    currentExerciseIndex.value = 0

    const firstExercice = day.exercices[0]
    remainingSeconds.value = firstExercice.dureeMinutes * 60
    //console.log(remainingSeconds.value)

    startTimer(day, saison)
  }

  const getCurrentExercise = (day) => {
    return day.exercices[currentExerciseIndex.value] ?? null
  }

  const startTimer = (day, saison) => {
    timerInterval = setInterval(() => {
      if(remainingSeconds.value > 0) {
        remainingSeconds.value--
      }
      else {
        currentExerciseIndex.value++
        const nextExercice = day.exercices[currentExerciseIndex.value]

        if(!nextExercice) {
          console.log('Séance terminée')

          // arrêt et reset du timer
          clearInterval(timerInterval)
          timerInterval = null
          
          // passage au jour suivant
          progressStore.goToNextDay(saison)

          // reset
          dayId.value = null
          currentExerciseIndex.value = 0
          remainingSeconds.value = 0
          return
        }
        
        if(nextExercice) {
          remainingSeconds.value = nextExercice.dureeMinutes * 60
        }

      }
    }, 1000)
  }

  const pauseSession = () => {
    clearInterval(timerInterval)
    timerInterval = null
  }

  const resumeSession = (day, saison) => {
    startTimer(day, saison)
  }

  return {
    dayId,
    currentExerciseIndex,
    remainingSeconds,
    startSession,
    getCurrentExercise,
    startTimer,
    pauseSession,
    resumeSession
  }
})