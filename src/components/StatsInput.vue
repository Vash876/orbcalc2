<template>
  <div class="calculator-container">
    <h1>Orb Calculator</h1>

    <!-- Cup Multi -->
    <div class="input-area">
      <div class="boosts-inputs">
        <div class="boost-row">
          <button @click="resetAllFields" class="reset-button">Reset All Fields</button>
        </div>
        <div class="boost-row">
          <label class="cup-label">Catch-Up Multiplier</label>
          <span class="cup-display">
            {{ formatNumber(calculateCupMultiplier(currentStats.hoursInTR)) }}
          </span>
          <span class="improvedmulti-display">
            ➡️ 
            {{ formatNumber(calculateCupMultiplier(improvedStats.hoursInTR)) }}
          </span>
        </div>
        <!-- Eingabebereich -->  
        <div v-for="(boost, index) in getBoosts" :key="boost.key" class="boost-row">
          <label :for="boost.key">{{ boost.label }}</label>

          <!-- Number Inputs -->
          <template v-if="boost.type === 'number'">
            <!-- Current Stats Input -->
            <button @click="decreaseCurrent(boost.key)" tabindex="-1">-</button>
            <input
              type="number"
              v-model.number="currentStats[boost.key]"
              :id="boost.key"
              :placeholder="'Current ' + boost.label"
              :max="boost.max || null"
              class="current-input"
              @input="onInputChange(boost.key, boost.max, 'currentStats')"
              :tabindex="index + 1"
            />
            <button class="current-increase" @click="increaseCurrent(boost.key, boost.max)" tabindex="-1">+</button>

            <!-- Improved Stats Input -->
            <div class="improved-input">
              <!-- Bedingte Anzeige: DatePicker für hoursInTR -->
              <template v-if="boost.key === 'hoursInTR'">
                <flat-pickr
                  v-model="improvedDate"
                  :config="flatpickrConfig"
                  :class="{ 'date-picker': true, 'error': isDateInPast }"
                  @onChange="handleDateChange"
                  :tabindex="inputBoosts.length + checkboxBoosts.length + index + 1"
                ></flat-pickr>
              </template>

              <!-- Standard-Input für alle anderen Boosts -->
              <template v-else>
                <button @click="decreaseImproved(boost.key)" tabindex="-1">-</button>
                <input
                  type="number"
                  v-model.number="improvedStats[boost.key]"
                  :placeholder="'Improved ' + boost.label"
                  :max="boost.max || null"
                  class="improved-input-field"
                  @input="onInputChange(boost.key, boost.max, 'improvedStats')"
                  :tabindex="inputBoosts.length + checkboxBoosts.length + index + 1"
                />
                <button @click="increaseImproved(boost.key, boost.max)" tabindex="-1">+</button>
              </template>

              <!-- Multiplier Display -->
              <span class="currentmulti-display">
                {{ formatNumber(calculateMultiplier(boost, currentStats[boost.key], currentStats)) }}
              </span>  
              <span class="improvedmulti-display">
                ➡️ 
                {{ formatNumber(calculateMultiplier(boost, improvedStats[boost.key], improvedStats)) }}
              </span>
            </div>
          </template>

          <!-- Checkbox Inputs -->
          <template v-if="boost.type === 'boolean'">
            <input
              type="checkbox"
              v-model="currentStats[boost.key]"
              :id="'current-' + boost.key"
              class="current-checkbox"
              @change="handleCheckboxChange(boost.key, 'current')"
              :tabindex="index + 1"
            />
            <input
              type="checkbox"
              v-model="improvedStats[boost.key]"
              :disabled="currentStats[boost.key]"
              :id="'improved-' + boost.key"
              class="improved-checkbox"
              @change="handleCheckboxChange(boost.key, 'improved')"
              :tabindex="inputBoosts.length + checkboxBoosts.length + index + 1"
            />

            <!-- Multiplier Display -->
            <span class="currentmulti-display">
              {{ formatNumber(calculateMultiplier(boost, currentStats[boost.key], currentStats)) }}
            </span>
            <span class="improvedmulti-display">
              ➡️ 
              {{ formatNumber(calculateMultiplier(boost, improvedStats[boost.key], improvedStats)) }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
  
  
  <script>
  import { calculateMultiplier, 
           calculateCupMultiplier,
           calculateAdditionalHours
  } 
  from "../utils/calculations";

  import { increaseValue, 
           decreaseValue, 
           formatNumber, 
           saveToLocalStorage, 
           loadFromLocalStorage, 
           resetAllFields, 
           loadOrInitializeStats, 
           ensureImprovedStatsMinimum,
           clampValue,
           handleCheckboxChange 
  } 
  from '../utils/helpers';

  import { mapGetters } from "vuex";
  import { boosts } from '../store/boosts';
  import FlatPickr from "vue-flatpickr-component";
  import "flatpickr/dist/themes/dark.css";
  
  export default {
    name: "StatsInput",

    components: {
      FlatPickr,
    },

    data() {
      return {
        currentStats: {},
        improvedStats: {},
        improvedDate: null, // Der vom Benutzer ausgewählte Zeitpunkt
        flatpickrConfig: {
          enableTime: true,
          dateFormat: "Y-m-d H:i", // Datum und Uhrzeit
          defaultDate: new Date(), // Standardmäßig aktuelles Datum und Uhrzeit
        },
      };
    },
    computed: {
      ...mapGetters(["getBoosts"]),
      inputBoosts() { 
        return this.getBoosts.filter((boost) => boost.type === "number");
      },
      checkboxBoosts() {
        return this.getBoosts.filter((boost) => boost.type === "boolean");
      },
      isDateInPast() {
        return calculateAdditionalHours(new Date(), this.improvedDate) === 0;
      },
    },
    methods: {
      saveToLocalStorage() {
        saveToLocalStorage(this.currentStats, this.improvedStats);
      },
      increaseCurrent(key, max) {
          increaseValue(this.currentStats, key, max, this.saveToLocalStorage);
      },
      decreaseCurrent(key) {
          decreaseValue(this.currentStats, key, 0, this.saveToLocalStorage); // `0` ist der minimale Wert
      },
      increaseImproved(key, max) {
          increaseValue(this.improvedStats, key, max, this.saveToLocalStorage);
      },
      decreaseImproved(key) {
          decreaseValue(this.improvedStats, key, this.currentStats[key], this.saveToLocalStorage);
      },
      updateImprovedStats() {
        ensureImprovedStatsMinimum(this.currentStats, this.improvedStats);
        this.saveToLocalStorage();
      },

      onInputChange(key, max, statsType) {
        const value = this[statsType][key];
        const clampedValue = clampValue(value, max);

        if (statsType === "improvedStats" && clampedValue < this.currentStats[key]) {
          this[statsType][key] = this.currentStats[key]; // Wert auf Current Stats begrenzen
        } else {
          this[statsType][key] = clampedValue; // Wert auf Maximalwert begrenzen
        }

        this.saveToLocalStorage();
      },

      handleCheckboxChange(key, type) {
        handleCheckboxChange(key, type, this.currentStats, this.improvedStats, this.saveToLocalStorage);
      },

      handleDateChange(selectedDate) {
        const additionalHours = calculateAdditionalHours(new Date(), selectedDate);
        this.improvedStats.hoursInTR = this.currentStats.hoursInTR + additionalHours;
        this.saveToLocalStorage();
      },

      calculateMultiplier, formatNumber, loadFromLocalStorage,  resetAllFields, calculateCupMultiplier
    },

    watch: {
      currentStats: {
        handler() {
          this.updateImprovedStats();
        },
        deep: true, // Damit Änderungen an geschachtelten Objekten überwacht werden
      },
    },

    mounted() {
      const stats = loadOrInitializeStats(boosts);
      this.currentStats = { ...stats.currentStats };
      this.improvedStats = { ...stats.improvedStats };
      this.updateImprovedStats();
    },
  };
  </script>
  