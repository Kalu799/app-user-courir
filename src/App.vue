<script setup></script>

<template>
  <header class="app-header">
    <img src="/icons/image.png" alt="Je cours pour ma forme" class="app-header__logo">
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
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 88px;
  padding: 12px 16px;

  background-color: #ffffff;
  border-bottom: 1px solid rgb(2 44 77 / 8%);
}

.app-header__logo {
  display: block;

  width: min(220px, 70vw);
  height: auto;

  object-fit: contain;
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
    width: 80px;
    height: 80px;
  }
}
</style>
