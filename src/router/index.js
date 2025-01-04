import { createRouter, createWebHistory } from "vue-router";
import OrbCalc from "../components/OrbCalc.vue";
import ShortsPlanner from "../components/ShortsPlanner.vue";

const routes = [
  { path: "/orb-calc", component: OrbCalc },
  { path: "/shorts-planner", component: ShortsPlanner },
  { path: "/", redirect: "/orb-calc" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
