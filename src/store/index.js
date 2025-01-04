import { createStore } from "vuex";
import { boosts } from "./boosts";

export const store = createStore({
  state: {
    currentStats: boosts.reduce((stats, boost) => {
      stats[boost.key] = boost.type === "number" ? 0 : false;
      return stats;
    }, {}), // Initialisiert currentStats mit Standardwerten
    improvedStats: boosts.reduce((stats, boost) => {
      stats[boost.key] = boost.type === "number" ? 0 : false;
      return stats;
    }, {}), // Initialisiert improvedStats mit Standardwerten
    shorts: [], // Speichert die Daten der Shorts
    boostSelection: boosts.reduce((selection, boost) => {
      selection[boost.key] = false;
      return selection;
    }, {}), // Auswahl der Boosts, die in weiteren Shorts verwendet werden sollen
  },
  getters: {
    getBoosts: () => boosts, // Gibt die Boosts zurück
    getCurrentStats: (state) => state.currentStats, // Gibt currentStats zurück
    getImprovedStats: (state) => state.improvedStats, // Gibt improvedStats zurück
    getShorts: (state) => state.shorts, // Gibt die Shorts zurück
    getBoostSelection: (state) => state.boostSelection, // Gibt die Boost-Auswahl zurück
  },
  mutations: {
    updateCurrentStats(state, stats) {
      state.currentStats = stats;
    },
    updateImprovedStats(state, stats) {
      state.improvedStats = stats;
    },
    updateShorts(state, shorts) {
      state.shorts = shorts;
    },
    updateBoostSelection(state, boostSelection) {
      state.boostSelection = boostSelection;
    },
  },
  actions: {
    updateCurrentStats({ commit }, stats) {
      commit("updateCurrentStats", stats);
    },
    updateImprovedStats({ commit }, stats) {
      commit("updateImprovedStats", stats);
    },
    updateShorts({ commit }, shorts) {
      commit("updateShorts", shorts);
    },
    updateBoostSelection({ commit }, boostSelection) {
      commit("updateBoostSelection", boostSelection);
    },
  },
});
