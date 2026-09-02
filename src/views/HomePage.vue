<script setup>

import { onMounted } from 'vue'

import { useProgressStore } from '@/stores/progress'
import { useSaisonsStore } from '@/stores/saisons'
import { useSessionStore } from '@/stores/session'

const progressStore = useProgressStore()
const saisonsStore = useSaisonsStore()
const sessionStore = useSessionStore()

onMounted(async () => {
  await saisonsStore.getSaisons()
  //console.log(saisons.value)
  sessionStore.loadSession()
})

</script>

<template>

  <h1>Homepage</h1>

  <button @click="progressStore.goToNextDay(saisonsStore.saisons[0])">
    Next Day
  </button>

  <button @click="sessionStore.startSession(
    saisonsStore.currentDay,
    saisonsStore.saisons[0]
  )">
    Lancer la séance
  </button>

  <br>
  <br>

  <button v-if="sessionStore.dayId" @click="sessionStore.stopSession()">
    Arrêter
  </button>

  <button v-if="sessionStore.dayId && !sessionStore.isPaused" @click="sessionStore.pauseSession()">
    Pause
  </button>

  <button v-if="sessionStore.dayId && sessionStore.isPaused" @click="sessionStore.resumeSession(
    saisonsStore.currentDay,
    saisonsStore.saisons[0]
  )">
    Reprendre
  </button>

  <br>
  <br>

  <button @click="progressStore.resetSaison()">
    Reset saison
  </button>

  <button @click="progressStore.resetWeek(saisonsStore.saisons[0])">
    Reset semaine
  </button>

  <button v-if="sessionStore.dayId" @click="sessionStore.stopSession()">
    Reset jour
  </button>


  <p v-if="sessionStore.dayId && saisonsStore.currentDay">Exercice courant : {{
    sessionStore.getCurrentExercise(saisonsStore.currentDay)?.type }}</p>

  <p v-if="sessionStore.dayId">Temps restant : {{ sessionStore.formattedTime }} secondes</p>

  <p v-if="sessionStore.dayId && saisonsStore.currentDay">
    Étape {{ sessionStore.currentExerciseIndex + 1 }}
    sur {{ saisonsStore.currentDay.exercices.length }}
  </p>

  <p v-if="saisonsStore.currentDay">
    Saison : {{ saisonsStore.saisons[0].label }}
  </p>

  <p v-if="saisonsStore.currentWeek">
    Semaine : {{ saisonsStore.currentWeek.numero }}
  </p>

  <p v-if="saisonsStore.currentDay">
    Jour : {{ saisonsStore.currentDay.label }}
  </p>

  <ul v-if="saisonsStore.currentDay">
    <li v-for="(exercice, index) in saisonsStore.currentDay.exercices" :key="index">
      {{ exercice.type }} - {{ exercice.dureeMinutes }} min
    </li>
  </ul>

</template>