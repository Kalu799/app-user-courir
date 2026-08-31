<script setup>

import { onMounted } from 'vue'

import { useProgressStore } from '@/stores/progress'
import { useSaisonsStore } from '@/stores/saisons'

const progressStore = useProgressStore()
const saisonsStore = useSaisonsStore()

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