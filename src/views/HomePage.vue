<script setup>

import { onMounted, onUnmounted, ref } from 'vue'

import { useProgressStore } from '@/stores/progress'
import { useSaisonsStore } from '@/stores/saisons'
import { useSessionStore } from '@/stores/session'

const progressStore = useProgressStore()
const saisonsStore = useSaisonsStore()
const sessionStore = useSessionStore()

const showResetOptions = ref(false)

const confirmStopSession = async () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment arrêter la séance ? Votre progression dans cette séance sera perdue.'
  )

  if (!confirmed) return

  await sessionStore.stopSession()

  feedbackMessage.value = 'Séance arrêtée. Votre progression n’a pas été modifiée.'
}

const confirmResetWeek = () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment recommencer cette semaine ? Vous reviendrez au premier jour de la semaine.'
  )

  if (!confirmed) return

  progressStore.resetWeek(saisonsStore.currentSaison)
  showResetOptions.value = false
}

const confirmResetSaison = () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment recommencer toute la saison ? Toute votre progression sur ce programme sera réinitialisée.'
  )

  if (!confirmed) return

  progressStore.resetSaison(saisonsStore.currentSaison)
  progressStore.hasStartedSaison = false
  showResetOptions.value = false
}

const startSession = () => {

  sessionStore.sessionStatus = null

  sessionStore.startSession(
    saisonsStore.currentDay,
    saisonsStore.currentSaison
  )
}

onMounted(async () => {
  await saisonsStore.getSaisons()

  //console.log('currentDay:', saisonsStore.currentDay)
  //console.log('currentDayDuration:', saisonsStore.currentDayDuration)
  //console.log(saisons.value)

  sessionStore.loadSession()
  sessionStore.initVisibilityListener()
})

onUnmounted(() => {
  // retire l'eventListener quand la vue est démontée pour ne pas en cumuler plusieurs au cas ou
  sessionStore.removeVisibilityListener()
})

</script>

<template>

  <!-- écran programme / accueil -->
  <section v-if="!sessionStore.dayId" class="program-screen">
    <div class="program-container">

      <div v-if="!progressStore.hasStartedSaison" class="season-selector">
        <label for="saison-select" class="season-selector__label">
          Choisir mon programme
        </label>

        <select id="saison-select" class="season-selector__select" :value="progressStore.currentSaisonId" @change="progressStore.changeSaison(
          saisonsStore.saisons.find(
            saison => saison.id === $event.target.value
          )
        )">
          <option v-for="saison in saisonsStore.saisons" :key="saison.id" :value="saison.id">
            {{ saison.label }}
          </option>
        </select>
      </div>

      <div class="session-feedback">
        <p v-if="sessionStore.sessionStatus === 'completed'" class="session-feedback__message">
          Séance terminée ! Bravo 🎉
        </p>

        <p v-if="sessionStore.sessionStatus === 'season-completed'" class="session-feedback__message">
          Saison terminée ! Bravo 🎉 Vous pouvez choisir un nouveau programme.
        </p>

        <p v-if="sessionStore.sessionStatus === 'stopped'" class="session-feedback__message">
          Séance arrêtée. Votre progression n’a pas été modifiée.
        </p>
      </div>

      <div class="program-card">

        <p v-if="saisonsStore.currentSaison" class="program-card__season">
          {{ saisonsStore.currentSaison.label }}
        </p>

        <div class="program-card__progress">
          <p v-if="saisonsStore.currentWeek" class="program-card__week">
            Semaine {{ saisonsStore.currentWeek.numero }}
          </p>

          <p v-if="saisonsStore.currentDay" class="program-card__day">
            {{ saisonsStore.currentDay.label }}
          </p>
        </div>

        <div v-if="saisonsStore.currentDay" class="program-card__summary">
          <p class="program-card__steps">
            {{ saisonsStore.currentDay.exercices.length }} étapes
          </p>

          <p class="program-card__duration">
            Environ {{ saisonsStore.currentDayDuration }} min
          </p>
        </div>

        <details v-if="saisonsStore.currentDay" class="exercise-details">
          <summary class="exercise-details__summary">
            Voir les détails des étapes
          </summary>

          <ul class="exercise-list">
            <li v-for="(exercice, index) in saisonsStore.currentDay.exercices" :key="index" class="exercise-list__item">
              {{ exercice.type }} — {{ exercice.dureeMinutes }} min
            </li>
          </ul>
        </details>

        <button v-if="saisonsStore.currentDay" class="start-session-btn" @click="startSession">
          Lancer la séance
        </button>
      </div>

      <div class="progress-settings">
        <button class="progress-settings__toggle" @click="showResetOptions = !showResetOptions">
          Gérer ma progression
        </button>

        <div v-if="showResetOptions" class="progress-settings__actions">
          <button class="progress-settings__btn" @click="confirmResetWeek">
            Recommencer la semaine
          </button>

          <button class="progress-settings__btn progress-settings__btn--danger" @click="confirmResetSaison">
            Recommencer la saison
          </button>
        </div>
      </div>

    </div>
  </section>


  <!-- écran séance en cours -->
  <section v-else class="session-screen">
    <div class="session-container">

      <p class="session-step">
        Étape {{ sessionStore.currentExerciseIndex + 1 }}
        sur {{ saisonsStore.currentDay.exercices.length }}
      </p>

      <div class="session-progress">
        <div class="session-progress__bar" :style="{
          width: `${((sessionStore.currentExerciseIndex + 1) / saisonsStore.currentDay.exercices.length) * 100}%`
        }"></div>
      </div>

      <p v-if="sessionStore.isPaused" class="session-paused">
        PAUSE
      </p>

      <h2 class="session-exercise">
        {{ sessionStore.getCurrentExercise(saisonsStore.currentDay)?.type }}
      </h2>

      <p class="session-timer">
        {{ sessionStore.formattedTime }}
      </p>

      <div class="session-actions">
        <button v-if="!sessionStore.isPaused" class="session-main-btn" @click="sessionStore.pauseSession()">
          Pause
        </button>

        <button v-else class="session-main-btn" @click="sessionStore.resumeSession(
          saisonsStore.currentDay,
          saisonsStore.currentSaison
        )">
          Reprendre
        </button>

        <button class="session-stop-btn" @click="confirmStopSession">
          Arrêter la séance
        </button>
      </div>

    </div>
  </section>

</template>

<style scoped>
/* =========================================================
   ÉCRAN PROGRAMME
   ========================================================= */

.program-screen {
  min-height: 100%;
  padding: 24px 16px 40px;

  background-color: #f7f8f5;
  color: #022c4d;
}

.program-container {
  width: 100%;
  max-width: 480px;

  margin: 0 auto;
}


/* =========================================================
   SÉLECTION DE LA SAISON
   ========================================================= */

.season-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;

  margin-bottom: 20px;
}

.season-selector__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #022c4d;
}

.season-selector__select {
  width: 100%;

  padding: 14px 16px;

  border: 1px solid #d8ded3;
  border-radius: 12px;

  background-color: #ffffff;
  color: #022c4d;

  font: inherit;
  font-size: 1rem;

  cursor: pointer;
}

.season-selector__select:focus {
  outline: 3px solid rgb(133 188 36 / 20%);
  border-color: #85bc24;
}


/* =========================================================
   FEEDBACK APRÈS UNE SÉANCE
   ========================================================= */

.session-feedback {
  margin-bottom: 20px;
}

.session-feedback:empty {
  display: none;
}

.session-feedback__message {
  margin: 0;
  padding: 16px 18px;

  border-radius: 16px;

  background-color: #ffffff;
  border: 1px solid rgb(2 44 77 / 8%);

  box-shadow: 0 6px 20px rgb(2 44 77 / 6%);

  color: #022c4d;

  font-size: 0.95rem;
  line-height: 1.45;
  font-weight: 700;
}


/* =========================================================
   CARTE DE LA PROCHAINE SÉANCE
   ========================================================= */

.program-card {
  padding: 24px 20px;

  background-color: #ffffff;

  border-radius: 20px;

  box-shadow:
    0 2px 8px rgb(2 44 77 / 6%),
    0 12px 32px rgb(2 44 77 / 8%);
}


/* Saison */

.program-card__season {
  margin: 0 0 20px;

  color: #85bc24;

  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
}


/* Semaine + jour */

.program-card__progress {
  margin-bottom: 20px;
}

.program-card__week {
  margin: 0 0 4px;

  color: #022c4d;

  font-size: 1.2rem;
  font-weight: 700;
}

.program-card__day {
  margin: 0;

  color: #52616c;

  font-size: 1rem;
  font-weight: 500;
}


/* =========================================================
   RÉSUMÉ DE LA SÉANCE
   ========================================================= */

.program-card__summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  margin-bottom: 24px;
}

.program-card__steps,
.program-card__duration {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 72px;

  margin: 0;
  padding: 12px;

  border-radius: 14px;

  background-color: #f2f6ed;

  color: #022c4d;

  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
}


/* =========================================================
   LISTE DES EXERCICES
   ========================================================= */

.exercise-details {
  margin-bottom: 24px;
}

.exercise-details__summary {
  padding: 12px 0;

  color: #022c4d;

  font-size: 0.95rem;
  font-weight: 700;

  cursor: pointer;
}

.exercise-details__summary::marker {
  color: #85bc24;
}

.exercise-details[open] .exercise-details__summary {
  margin-bottom: 8px;
}


/* =========================================================
   BOUTON PRINCIPAL
   ========================================================= */

.start-session-btn {
  width: 100%;
  min-height: 58px;

  padding: 14px 20px;

  border: none;
  border-radius: 16px;

  background-color: #85bc24;
  color: #ffffff;

  font: inherit;
  font-size: 1.05rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.start-session-btn:active {
  transform: scale(0.98);
}

.start-session-btn:focus-visible {
  outline: 3px solid rgb(133 188 36 / 30%);
  outline-offset: 3px;
}


/* =========================================================
   GESTION DE LA PROGRESSION
   ========================================================= */

.progress-settings {
  margin-top: 32px;

  text-align: center;
}

.progress-settings__toggle {
  padding: 10px 14px;

  border: none;

  background: none;

  color: #66757f;

  font: inherit;
  font-size: 0.85rem;

  text-decoration: underline;

  cursor: pointer;
}

.progress-settings__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 14px;
  padding: 16px;

  border-radius: 14px;

  background-color: #ffffff;

  box-shadow: 0 4px 18px rgb(2 44 77 / 6%);
}

.progress-settings__btn {
  width: 100%;
  min-height: 48px;

  padding: 12px 16px;

  border: 1px solid #d6dde1;
  border-radius: 12px;

  background-color: #ffffff;
  color: #022c4d;

  font: inherit;
  font-weight: 600;

  cursor: pointer;
}

.progress-settings__btn:active {
  transform: scale(0.98);
}

.progress-settings__btn--danger {
  border-color: #d95c5c;

  color: #b43b3b;
}


/* =========================================================
   TABLETTE / DESKTOP
   L'app reste volontairement étroite car elle est pensée mobile.
   ========================================================= */

@media (min-width: 600px) {
  .program-screen {
    padding-top: 40px;
  }

  .program-card {
    padding: 30px;
  }

  .program-card__season {
    font-size: 2rem;
  }
}

/* =========================================================
   ÉCRAN SÉANCE
   ========================================================= */

.session-screen {
  min-height: 100%;
  padding: 32px 16px 48px;

  background-color: #022c4d;
  color: #ffffff;
}

.session-container {
  width: 100%;
  max-width: 480px;

  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}


/* =========================================================
   PROGRESSION DANS LA SÉANCE
   ========================================================= */

.session-step {
  margin: 0 0 20px;

  font-size: 0.95rem;
  font-weight: 600;

  color: rgb(255 255 255 / 75%);
}

.session-progress {
  width: 100%;
  height: 8px;

  margin-bottom: 28px;

  overflow: hidden;

  border-radius: 999px;

  background-color: rgb(255 255 255 / 15%);
}

.session-progress__bar {
  height: 100%;

  border-radius: inherit;

  background-color: #85bc24;

  transition: width 0.3s ease;
}

/* =========================================================
   EXERCICE COURANT
   ========================================================= */

.session-exercise {
  margin: 0 0 16px;

  font-size: clamp(2rem, 10vw, 3.5rem);
  line-height: 1;
  font-weight: 900;

  text-transform: uppercase;

  color: #85bc24;
}


/* =========================================================
   TIMER
   ========================================================= */

.session-timer {
  margin: 20px 0 40px;

  font-size: clamp(4.5rem, 22vw, 7rem);
  line-height: 1;
  font-weight: 900;

  letter-spacing: -0.05em;

  font-variant-numeric: tabular-nums;
}

.session-paused {
  margin: 0 0 12px;
  padding: 8px 14px;

  border-radius: 999px;

  background-color: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 20%);

  color: #ffffff;

  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}


/* =========================================================
   ACTIONS
   ========================================================= */

.session-actions {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 20px;
}

.session-main-btn {
  width: 100%;
  min-height: 68px;

  padding: 16px 24px;

  border: none;
  border-radius: 18px;

  background-color: #85bc24;
  color: #ffffff;

  font: inherit;
  font-size: 1.2rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.session-main-btn:active {
  transform: scale(0.98);
}

.session-main-btn:focus-visible {
  outline: 3px solid rgb(255 255 255 / 40%);
  outline-offset: 4px;
}


/* =========================================================
   ARRÊT DE LA SÉANCE
   ========================================================= */

.session-stop-btn {
  padding: 12px 16px;

  border: none;

  background: transparent;
  color: rgb(255 255 255 / 65%);

  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;

  text-decoration: underline;

  cursor: pointer;
}

.session-stop-btn:active {
  opacity: 0.7;
}


/* =========================================================
   TABLETTE / DESKTOP
   ========================================================= */

@media (min-width: 600px) {
  .session-screen {
    padding-top: 48px;
  }

  .session-main-btn {
    max-width: 360px;
  }
}
</style>