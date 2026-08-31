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

  <p v-if="sessionStore.dayId && saisonsStore.currentDay">Exercice courant : {{
    sessionStore.getCurrentExercise(saisonsStore.currentDay)?.type }}</p>

  <p v-if="sessionStore.dayId">Temps restant : {{ sessionStore.remainingSeconds }} secondes</p>

  <p>Index exercice : {{ sessionStore.currentExerciseIndex }}</p>



  <p>Nombre de saisons : {{ saisonsStore.saisons.length }}</p>

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