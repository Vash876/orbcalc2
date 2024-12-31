<template>
  <div class="shorts-planner">
    <h2>Shorts Planner</h2>
    <div v-for="(short, index) in shorts" :key="index" class="calculator-container">  
      <div class="input-area">
        <h3>Short #{{ index + 1 }}</h3>
        <div v-for="boost in shortBoosts" :key="boost.key" class="boost-row">
          <label :for="boost.key + '-short-' + index">{{ boost.label }}</label>
          <div class="short-input">
            <button @click="decreaseShortBoost(index, boost.key)" :disabled="short[boost.key] <= 0">-</button>
            <span>{{ short[boost.key] }}</span>
            <button @click="increaseShortBoost(index, boost.key, boost.max)">+</button>
          </div>
        </div>
      </div>
    </div>
    <button v-if="shorts.length < 5" @click="addNewShort">+ Add New Short</button>
    <p v-if="shorts.length >= 5">You can add a maximum of 5 Shorts.</p>
  </div>
</template>

<script>
import { boosts } from "../store/boosts";
import { saveToLocalStorage } from "../utils/helpers";

export default {
  name: "ShortsPlanner",
  data() {
    return {
      shorts: [],
    };
  },
  computed: {
    shortBoosts() {
      return boosts.filter((boost) => boost.expand === "1");
    },
  },
  methods: {
    addNewShort() {
      if (this.shorts.length < 5) {
        const newShort = {};
        this.shortBoosts.forEach((boost) => {
          newShort[boost.key] = 0; // Standardwert
        });
        this.shorts.push(newShort);
        this.saveShortsToLocalStorage();
      }
    },
    increaseShortBoost(index, key, max) {
      if (!max || this.shorts[index][key] < max) {
        this.shorts[index][key]++;
        this.saveShortsToLocalStorage();
      }
    },
    decreaseShortBoost(index, key) {
      if (this.shorts[index][key] > 0) {
        this.shorts[index][key]--;
        this.saveShortsToLocalStorage();
      }
    },
    saveShortsToLocalStorage() {
      saveToLocalStorage("shorts", this.shorts);
    },
    loadShortsFromLocalStorage() {
      const savedShorts = localStorage.getItem("shorts");
      if (savedShorts) {
        this.shorts = JSON.parse(savedShorts);
      }
    },
  },
  mounted() {
    this.loadShortsFromLocalStorage();
  },
};
</script>
