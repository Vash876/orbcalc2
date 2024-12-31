import { createStore } from "vuex";
import { boosts } from "./boosts";

export const store = createStore({
  state: {
    currentStats: {},
    improvedStats: {},
  },
  getters: {
    getBoosts: () => boosts,
  },
  mutations: {
    updateCurrentStats(state, stats) {
      state.currentStats = stats;
    },
    updateImprovedStats(state, stats) {
      state.improvedStats = stats;
    },
  },
  actions: {
    updateCurrentStats({ commit }, stats) {
      commit("updateCurrentStats", stats);
    },
    updateImprovedStats({ commit }, stats) {
      commit("updateImprovedStats", stats);
    },
  },
});
