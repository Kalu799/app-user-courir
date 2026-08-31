import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const dayId = ref(null)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)

  const startSession = (day) => {
    dayId.value = day.id
    //console.log(dayId.value)

    currentExerciseIndex.value = 0

    const firstExercice = day.exercices[0]
    remainingSeconds.value = firstExercice.dureeMinutes * 60
    console.log(remainingSeconds.value)
  }

  const getCurrentExercise = (day) => {
    return day.exercices[currentExerciseIndex.value] ?? null
  }

  const startTimer = () => {

  }

  return {
    dayId,
    currentExerciseIndex,
    remainingSeconds,
    startSession,
    getCurrentExercise,
    startTimer
  }
})