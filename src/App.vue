<template>
  <div id="app">
    <div class="navbar">
      <router-link to="/orb-calc" active-class="active-link">Orb Calculator</router-link>
      <router-link to="/shorts-planner" active-class="active-link">Shorts Planner</router-link>
    </div>
    <router-view />
  </div>
  <footer>
    <p>© 2025 Orb Calculator by Vash</p>
  </footer>
</template>

<script>

export default {
  mounted() {
    // Prüfe, ob der Nutzer bereits auf einer Seite ist, sonst leite ihn zu Current Stats weiter
    if (this.$router.currentRoute.path !== '/orb-calc') {
      this.$router.push('/orb-calc');
    }
  },
};
</script>

