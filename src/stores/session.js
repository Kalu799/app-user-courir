import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useProgressStore } from './progress'

export const useSessionStore = defineStore('session', () => {
  const progressStore = useProgressStore()

  const dayId = ref(null)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)
  let timerInterval = null
  const isPaused = ref(false)

  const startSession = (day, saison) => {
    isPaused.value = false

    dayId.value = day.id
    //console.log(dayId.value)

    currentExerciseIndex.value = 0

    const firstExercice = day.exercices[0]
    remainingSeconds.value = firstExercice.dureeMinutes * 60
    //console.log(remainingSeconds.value)

    saveSession()

    startTimer(day, saison)
  }

  const getCurrentExercise = (day) => {
    return day.exercices[currentExerciseIndex.value] ?? null
  }

  const startTimer = (day, saison) => {

    // check pour empêcher de lancer 2 fois le timer
    if (timerInterval) return

    timerInterval = setInterval(() => {
      if(remainingSeconds.value > 0) {
        remainingSeconds.value--
        if (remainingSeconds.value % 5 === 0) {
          saveSession()
        }
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
          isPaused.value = false

          localStorage.removeItem('activeSession')
          return
        }
        
        remainingSeconds.value = nextExercice.dureeMinutes * 60
        saveSession()

      }
    }, 1000)
  }

  const pauseSession = () => {
    isPaused.value = true
    clearInterval(timerInterval)
    timerInterval = null
    saveSession()
  }

  const resumeSession = (day, saison) => {
    isPaused.value = false
    startTimer(day, saison)
  }

  const stopSession = () => {
    clearInterval(timerInterval)
    timerInterval = null

    dayId.value = null
    currentExerciseIndex.value = 0
    remainingSeconds.value = 0
    isPaused.value = false

    localStorage.removeItem('activeSession')
  }

  const saveSession = () => {
    const sessionData = {
      dayId: dayId.value,
      currentExerciseIndex: currentExerciseIndex.value,
      remainingSeconds: remainingSeconds.value
    }
    localStorage.setItem('activeSession', JSON.stringify(sessionData))
  }

  const loadSession = () => {
    const savedSession = localStorage.getItem('activeSession')
    if (!savedSession) return

    const sessionData = JSON.parse(savedSession)
    console.log(sessionData)

    dayId.value = sessionData.dayId
    currentExerciseIndex.value = sessionData.currentExerciseIndex
    remainingSeconds.value = sessionData.remainingSeconds
    isPaused.value = true
  }

  return {
    dayId,
    currentExerciseIndex,
    remainingSeconds,
    isPaused,
    startSession,
    getCurrentExercise,
    startTimer,
    pauseSession,
    resumeSession,
    stopSession,
    saveSession,
    loadSession,
  }
})