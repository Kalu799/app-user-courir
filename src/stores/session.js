import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useProgressStore } from './progress'

export const useSessionStore = defineStore('session', () => {
  const progressStore = useProgressStore()

  const dayId = ref(null)
  const currentExerciseIndex = ref(0)
  const remainingSeconds = ref(0)
  let timerInterval = null
  let currentAudio = null
  const isPaused = ref(false)
  let wakeLock = null
  const sessionStatus = ref(null)

  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    // .padStart(2, "0") fait en sorte que le string fasse min 2 char et si il n'en fait qu'un, on ajoute un "0" au début
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const exerciseSounds = {
    echauffement: '/sons/echauffement.mp3',
    trotte: '/sons/trottes.mp3',
    marche: '/sons/marches.mp3',
    etirement: '/sons/etirements.mp3'
  }

  const startSession = async (day, saison) => {
    progressStore.hasStartedSaison = true

    isPaused.value = false

    dayId.value = day.id
    //console.log(dayId.value)

    currentExerciseIndex.value = 0

    const firstExercice = day.exercices[0]
    remainingSeconds.value = firstExercice.dureeMinutes * 60
    //console.log(remainingSeconds.value)

    playExerciseSound(firstExercice)

    saveSession()

    await requestWakeLock()

    startTimer(day, saison)
  }

  const getCurrentExercise = (day) => {
    return day.exercices[currentExerciseIndex.value] ?? null
  }

  const startTimer = (day, saison) => {

    // check pour empêcher de lancer 2 fois le timer
    if (timerInterval) return

    timerInterval = setInterval(async () => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
        if (remainingSeconds.value % 5 === 0) {
          saveSession()
        }
      }
      else {
        currentExerciseIndex.value++
        const nextExercice = day.exercices[currentExerciseIndex.value]

        if (!nextExercice) {
          // arrêt du timer + audio
          clearRuntimeSession()

          await releaseWakeLock()

          // passage au jour suivant
          const progressStatus = progressStore.goToNextDay(saison)

          if (progressStatus === 'season-completed') {
            sessionStatus.value = 'season-completed'
          } else {
            sessionStatus.value = 'completed'
          }

          // reset
          dayId.value = null
          currentExerciseIndex.value = 0
          remainingSeconds.value = 0
          isPaused.value = false

          localStorage.removeItem('activeSession')
          return
        }

        remainingSeconds.value = nextExercice.dureeMinutes * 60
        playExerciseSound(nextExercice)
        saveSession()

      }
    }, 1)
  }

  const pauseSession = async () => {
    // met en pause
    isPaused.value = true
    // arrêt timer + ausio
    clearRuntimeSession()
    // unlock la veille de l'écran
    await releaseWakeLock()
    // save la session en cours
    saveSession()
  }

  const resumeSession = async (day, saison) => {
    isPaused.value = false

    const currentExercice = day.exercices[currentExerciseIndex.value]

    if (currentExercice) {
      playExerciseSound(currentExercice)
    }

    await requestWakeLock()

    startTimer(day, saison)
  }

  const stopSession = async () => {
    // arrêt timer + audio
    clearRuntimeSession()

    await releaseWakeLock()

    // reset
    dayId.value = null
    currentExerciseIndex.value = 0
    remainingSeconds.value = 0
    isPaused.value = false

    sessionStatus.value = 'stopped'

    // supp sauvegarde session dans localStorage
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
    //console.log(sessionData)

    clearRuntimeSession()

    dayId.value = sessionData.dayId
    currentExerciseIndex.value = sessionData.currentExerciseIndex
    remainingSeconds.value = sessionData.remainingSeconds
    isPaused.value = true
  }

  const playExerciseSound = (exercise) => {
    const soundPath = exerciseSounds[exercise.type]
    if (!soundPath) return
    // évite de jouer 2 sons en même temps
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    // crée et lance le nouveau son
    currentAudio = new Audio(soundPath)
    currentAudio.play()
  }

  const requestWakeLock = async () => {
    // si le wakelock n'est pas supporter -> stop
    if (!('wakeLock' in navigator)) return

    wakeLock = await navigator.wakeLock.request('screen')
    //console.log('start wakeLock : ' + wakeLock)
  }

  const releaseWakeLock = async () => {
    // si wakeLock n'est pas actif -> stop
    if (!wakeLock) return

    await wakeLock.release()
    wakeLock = null
    //console.log('fin wakeLock : ' + wakeLock)
  }

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && dayId.value && !isPaused.value) {
      await requestWakeLock()
    }
  }

  const initVisibilityListener = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const removeVisibilityListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  const clearRuntimeSession = () => {
    // arrêt du timer
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    // arrêt de l'audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
    }
  }

  return {
    dayId,
    currentExerciseIndex,
    remainingSeconds,
    isPaused,
    formattedTime,
    sessionStatus,
    startSession,
    getCurrentExercise,
    startTimer,
    pauseSession,
    resumeSession,
    stopSession,
    saveSession,
    loadSession,
    requestWakeLock,
    releaseWakeLock,
    handleVisibilityChange,
    initVisibilityListener,
    removeVisibilityListener,
  }
})