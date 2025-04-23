<template>
  <div id="app">
    <div class="update-banner">
      <a href="https://hunter-sim2.netlify.app/tools/tr-planner" target="_blank">
        New Version available on hunter-sim2.netlify.app
      </a>
    </div>
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

<style scoped>
.update-banner {
  background-color: #ff6b6b;
  border-bottom: 1px solid #ff4444;
  color: white;
  text-align: center;
  padding: 8px 0;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11; /* Höher als die Navbar (z-index: 10) */
  font-weight: bold;
}

.update-banner a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.navbar {
  display: flex;
  padding: 10px 20px;
  border-bottom: 1px solid #dee2e6;
  margin-top: 35px; /* Platz für das Banner schaffen */
}

/* Anpassung für den Content, damit er unter dem Banner und der Navbar erscheint */
#app {
  padding-top: 35px;
}
</style>