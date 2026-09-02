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

  <br>

  <button @click="progressStore.goToNextDay(saisonsStore.currentSaison)">
    Next Day
  </button>

  <br>

  <div class="reset-btns-wrapper">

    <button @click="progressStore.resetSaison(saisonsStore.currentSaison)">
      Reset saison
    </button>

    <button @click="progressStore.resetWeek(saisonsStore.currentSaison)">
      Reset semaine
    </button>

    <button v-if="sessionStore.dayId" @click="sessionStore.stopSession()">
      Reset jour
    </button>

  </div>


  <div class="current-saison-wrapper">

    <h2>Selection de la saison :</h2>

    <select :value="progressStore.currentSaisonId"
      @change="progressStore.changeSaison(saisonsStore.saisons.find(saison => saison.id === $event.target.value))">
      <option v-for="saison in saisonsStore.saisons" :key="saison.id" :value="saison.id">
        {{ saison.label }}
      </option>
    </select>

    <p v-if="saisonsStore.currentSaison">
      Saison : {{ saisonsStore.currentSaison.label }}
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

  </div>


  <div class="startSess-btn-wrapper">

    <button @click="sessionStore.startSession(
      saisonsStore.currentDay,
      saisonsStore.currentSaison
    )">
      Lancer la séance
    </button>

  </div>


  <div class="current-exo-wrapper">

    <h2 v-if="sessionStore.dayId">Exercice en cours :</h2>

    <p v-if="sessionStore.dayId && saisonsStore.currentDay">Exercice courant : {{
      sessionStore.getCurrentExercise(saisonsStore.currentDay)?.type }}</p>

    <p v-if="sessionStore.dayId">Temps restant : {{ sessionStore.formattedTime }} secondes</p>

    <p v-if="sessionStore.dayId && saisonsStore.currentDay">
      Étape {{ sessionStore.currentExerciseIndex + 1 }}
      sur {{ saisonsStore.currentDay.exercices.length }}
    </p>

    <div class="session-btns-wrapper">

      <button v-if="sessionStore.dayId" @click="sessionStore.stopSession()">
        Arrêter
      </button>

      <button v-if="sessionStore.dayId && !sessionStore.isPaused" @click="sessionStore.pauseSession()">
        Pause
      </button>

      <button v-if="sessionStore.dayId && sessionStore.isPaused" @click="sessionStore.resumeSession(
        saisonsStore.currentDay,
        saisonsStore.currentSaison
      )">
        Reprendre
      </button>

    </div>

  </div>

</template>