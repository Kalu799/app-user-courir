<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from './stores/progress';
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const progressStore = useProgressStore()
const route = useRoute()

onMounted(async () => {
  await authStore.fetchMe()

  if (authStore.user?.currentSessionId) {
    progressStore.currentDayId = authStore.user.currentSessionId
  }
})
</script>

<template>
  <header class="app-header">

    <RouterLink v-if="authStore.isAuthenticated && route.path === '/profil'" to="/" class="app-header__back"
      aria-label="Retour à l'accueil">
      ←
    </RouterLink>

    <RouterLink to="/" class="app-header__home" aria-label="Retour à l'accueil">
      <img src="/icons/image.png" alt="Je cours pour ma forme" class="app-header__logo">
    </RouterLink>

    <RouterLink v-if="authStore.isAuthenticated" to="/profil" class="app-header__profile">
      <span class="app-header__profile-label">
        Mon profil
      </span>

      <strong class="app-header__profile-user">
        {{ authStore.user?.login }}
      </strong>
    </RouterLink>

  </header>

  <main class="app-main">
    <RouterView />
  </main>

  <footer class="app-footer">
    © Cepegra — 2026
  </footer>
</template>

<style scoped>
.app-header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 88px;
  padding: 12px 16px;

  background-color: #ffffff;
  border-bottom: 1px solid rgb(2 44 77 / 8%);
}


/* =========================================================
   RETOUR HOME
   ========================================================= */

.app-header__back {
  position: absolute;
  left: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  border-radius: 50%;

  background-color: #f2f6ed;
  color: #022c4d;

  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;

  text-decoration: none;
}

.app-header__back:active {
  transform: scale(0.95);
}


/* =========================================================
   LOGO
   ========================================================= */

.app-header__home {
  display: flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;
}

.app-header__logo {
  display: block;

  width: min(220px, 58vw);
  height: auto;

  object-fit: contain;
}


/* =========================================================
   PROFIL
   ========================================================= */

.app-header__profile {
  position: absolute;
  right: 12px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  min-width: 70px;
  min-height: 48px;

  padding: 8px 12px;

  border-radius: 12px;

  background-color: #f2f6ed;
  color: #022c4d;

  text-decoration: none;
}

.app-header__profile-label {
  font-size: 0.78rem;
  font-weight: 600;

  color: #66757f;
}

.app-header__profile-user {
  max-width: 100px;

  overflow: hidden;

  font-size: 0.95rem;
  font-weight: 800;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__profile:active {
  transform: scale(0.97);
}


/* =========================================================
   DESKTOP
   ========================================================= */

@media (min-width: 600px) {
  .app-header__logo {
    width: 260px;
    max-width: none;
  }

  .app-header__back {
    left: 24px;

    width: 46px;
    height: 46px;
  }

  .app-header__profile {
    right: 24px;

    min-width: 130px;
    min-height: 52px;

    padding: 9px 14px;
  }

  .app-header__profile-label {
    font-size: 0.82rem;
  }

  .app-header__profile-user {
    max-width: 160px;

    font-size: 1rem;
  }
}


/* Desktop uniquement */
@media (min-width: 600px) {
  .app-header__logo {
    width: 260px;
    max-width: none;
  }

  .app-header__profile {
    right: 24px;
  }

  .app-header__profile-user {
    max-width: 150px;
  }
}

.app-main {
  min-height: calc(100dvh - 136px);
}

.app-footer {
  padding: 16px;

  background-color: #f7f8f5;
  color: #73808a;

  text-align: center;
  font-size: 0.8rem;
}

@media (min-width: 600px) {
  .app-header {
    min-height: 96px;
  }

  .app-header__logo {
    width: 260px;
    max-width: none;
  }
}
</style>
