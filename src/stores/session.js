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
    // Le format reste stable pour éviter qu'un changement de largeur perturbe
    // l'affichage du minuteur entre, par exemple, 9:59 et 10:00.
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const exerciseSounds = {
    echauffement: '/sons/echauffement.mp3',
    trotte: '/sons/trottes.mp3',
    marche: '/sons/marches.mp3',
    etirement: '/sons/etirements.mp3',
    sprint: '/sons/sprints.mp3',
    deboule: '/sons/deboules.mp3',
    cours: '/sons/cours.mp3'
  }

  const startSession = async (day, saison) => {
    if (!day?.exercices?.length) return

    // On inscrit d'abord la séance côté serveur : le minuteur ne doit jamais
    // démarrer sur une progression que l'utilisateur ne pourrait pas retrouver.
    const saved = await progressStore.saveProgress(day.id)

    if (!saved) {
      sessionStatus.value = 'progress-error'
      return
    }

    progressStore.hasStartedSaison = true

    isPaused.value = false

    dayId.value = day.id
    currentExerciseIndex.value = 0

    const firstExercice = day.exercices[0]
    remainingSeconds.value = firstExercice.dureeMinutes * 60

    playExerciseSound(firstExercice)

    saveSession()

    await requestWakeLock()

    startTimer(day, saison)
  }

  const getCurrentExercise = (day) => {
    return day.exercices[currentExerciseIndex.value] ?? null
  }

  const startTimer = (day, saison) => {
    // Une seule boucle doit piloter le décompte, y compris après une reprise.
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
          // On libère les ressources locales avant l'appel réseau, afin de ne
          // pas laisser un son ou un intervalle actif en cas d'erreur API.
          clearRuntimeSession()

          await releaseWakeLock()

          // La progression ne change visuellement qu'après confirmation API.
          const progressStatus = await progressStore.goToNextDay(saison)

          if (progressStatus === 'progress-error') {
            sessionStatus.value = 'progress-error'
          } else if (progressStatus === 'season-completed') {
            sessionStatus.value = 'season-completed'
          } else {
            sessionStatus.value = 'completed'
          }

          // Cet état représente uniquement le minuteur, pas le programme choisi.
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
    }, 1000)
  }

  const pauseSession = async () => {
    isPaused.value = true
    clearRuntimeSession()
    await releaseWakeLock()
    // La pause est sauvegardée localement pour survivre à un rechargement de page.
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
    clearRuntimeSession()

    await releaseWakeLock()

    dayId.value = null
    currentExerciseIndex.value = 0
    remainingSeconds.value = 0
    isPaused.value = false

    sessionStatus.value = 'stopped'

    // L'arrêt abandonne seulement le minuteur en cours ; la progression du
    // programme reste celle enregistrée au démarrage de cette séance.
    localStorage.removeItem('activeSession')
  }

  const saveSession = () => {
    // Ce snapshot est volontairement limité à l'état du minuteur. La source de
    // vérité de la progression entre comptes reste l'API, pas localStorage.
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

    clearRuntimeSession()

    dayId.value = sessionData.dayId
    currentExerciseIndex.value = sessionData.currentExerciseIndex
    remainingSeconds.value = sessionData.remainingSeconds
    isPaused.value = true
  }

  const clearSavedSession = () => {
    clearRuntimeSession()

    dayId.value = null
    currentExerciseIndex.value = 0
    remainingSeconds.value = 0
    isPaused.value = false
    sessionStatus.value = null

    localStorage.removeItem('activeSession')
  }

  const playExerciseSound = (exercise) => {
    const soundPath = exerciseSounds[exercise.type]
    if (!soundPath) return
    // Un exercice ne doit jamais se superposer au signal du précédent.
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    currentAudio = new Audio(soundPath)
    currentAudio.play()
  }

  const requestWakeLock = async () => {
    // L'API n'est pas disponible dans tous les navigateurs : l'absence de
    // support ne doit pas empêcher la séance de fonctionner.
    if (!('wakeLock' in navigator)) return

    wakeLock = await navigator.wakeLock.request('screen')
  }

  const releaseWakeLock = async () => {
    if (!wakeLock) return

    await wakeLock.release()
    wakeLock = null
  }

  const handleVisibilityChange = async () => {
    // Les navigateurs peuvent relâcher le verrou lors d'un changement d'onglet.
    // On le redemande seulement pour une séance réellement active.
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
    // Les handles ne sont pas réactifs : ils représentent des ressources du
    // navigateur et doivent être libérés ensemble à chaque sortie de séance.
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

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
    clearSavedSession,
    requestWakeLock,
    releaseWakeLock,
    handleVisibilityChange,
    initVisibilityListener,
    removeVisibilityListener,
  }
})
