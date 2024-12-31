import { createRouter, createWebHistory } from "vue-router";
import Stats from "../components/Stats.vue";
import ShortsPlanner from "../components/ShortsPlanner.vue";

const routes = [
  { path: "/stats", component: Stats },
  { path: "/shorts-planner", component: ShortsPlanner },
  { path: "/", redirect: "/stats" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
