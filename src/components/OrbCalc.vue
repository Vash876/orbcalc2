<template>
  <div class="calculator-container">
    <div class="input-area">
      <div class="boosts-inputs">
        <div class="boost-row">
          <button
            class="instructions-button"
            @click="toggleInstructionsModal"    
          >
            Instructions
          </button>

          <div v-if="isInstructionsModalVisible" class="modal-overlay" @click.self="toggleInstructionsModal">
            <div class="modal-content">
              <button class="modal-close" @click="toggleInstructionsModal">x</button>
              <h2>Instructions</h2>
              <ul>
                <li>Enter your Current Stats in the left fields.</li>
                <li>Adjust Improved Stats on the right to see the effect on your Orb Gains.</li>
                <ul>
                  <li>Datepicker is for your planned End of TR</li>
                </ul>
                <li>Use the buttons to increment or decrement values.</li>
                <li>Hover over inputs for additional details.</li>
                <li>Smartphone users may switch to landscape mode for additional information.</li>
              </ul>
            </div>
          </div>
          <button @click="resetAllFields" class="reset-button">Reset All Fields</button>
        </div>

        <!--Catch Up Multiplier-->
        <div class="boost-row">
          <label class="tooltip">
            <label class="cup-label">{{ isMobile ? 'CatchUp' : 'Catch-Up Multiplier' }}</label>
          </label>
          <input
            type="number"
            id="catchupMultiplier"
            class="cup-input"
            tabindex="1"
            v-model.number="catchupMultiplier"
            @input="onCatchupMultiplierChange"
          />    
          <input
            type="number"
            id="improvedcatchupMultiplier"
            class="cup-input"
            tabindex="-1"
            style="margin-left: 15px;"
            :value="getImprovedCup()" 
            readonly 
          />
        </div>
        <!-- Eingabebereich -->  
        <div v-for="(boost, index) in getBoosts" :key="boost.key" class="boost-row">
          <label class="tooltip">
            <label :for="boost.key">{{ isMobile ? boost.mlabel : boost.label }}</label>
            <span v-if="boost.tooltip != 0" class="tooltiptext">{{ boost.tooltip }}</span>
          </label>
          <!-- Number Inputs -->
          <template v-if="boost.type === 'number'">
            <!-- Current Stats Input -->
            <button @click="decreaseCurrent(boost.key)" tabindex="-1">-</button>
            <input
              type="number"
              value = "1"
              v-model.number="currentStats[boost.key]"
              :id="boost.key + '-current'"
              :placeholder="'Value for ' + boost.label"
              :max="boost.max || null"
              class="current-input"
              :tabindex="1 + index + 1"
              @blur="onInputChange(currentStats, boost.key, boost.max, improvedStats)"
              @input="onInputChange(currentStats, boost.key, boost.max, improvedStats)"
            />
            <button class="current-increase" @click="increaseCurrent(boost.key, boost.max)" tabindex="-1">+</button>

            <!-- Improved Stats Input -->
            <div class="improved-input">
              <!-- Bedingte Anzeige: DatePicker für hoursInTR -->
              <template v-if="boost.key === 'hoursInTR'">
                <flat-pickr
                  v-model="datePickerValue"
                  id="improvedDatePicker"
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
                  :id="boost.key + '-improved'"
                  :placeholder="'Value for improved ' + boost.label"
                  :max="boost.max || null"
                  :class="{
                            'border-green': improvedStats[boost.key] > (currentStats[boost.key] || 0),
                            'border-blue': improvedStats[boost.key] <= (currentStats[boost.key] || 0)
                          }"
                  :tabindex="inputBoosts.length + checkboxBoosts.length + index + 1"
                  @blur="onInputChange(improvedStats, boost.key, boost.max, currentStats)"
                />
                <button @click="increaseImproved(boost.key, boost.max)" tabindex="-1">+</button>
              </template>

              <!-- Multiplier Display -->              
              <!-- nur desktop -->
              <div v-if="!isMobile">
                <span  class="currentmulti-display">
                  {{ formatNumber(calculateMultiplier(boost, currentStats[boost.key], currentStats)) }}
                </span>
                <span class="improvedmulti-display">
                  ➡️ 
                  {{ formatNumber(calculateMultiplier(boost, improvedStats[boost.key], improvedStats)) }}
                </span>
              </div>     
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
            <div v-if="!isMobile" class="desktop-view">
              <span class="currentmulti-display">
                {{ formatNumber(calculateMultiplier(boost, currentStats[boost.key], currentStats)) }}
              </span>
              <span class="improvedmulti-display">
                ➡️ 
                {{ formatNumber(calculateMultiplier(boost, improvedStats[boost.key], improvedStats)) }}
              </span>
            </div>
          </template>
        </div>
      </div>
      <table class="orb-results-table">
        <thead>
          <tr>
            <th>Current Orbs</th>
            <th></th>
            <th>Improved Orbs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="current-orbs"><strong>{{ formatNumber(currentOrbs) }}</strong></td>
            <td class="arrow-cell">➡️</td>
            <td class="improved-orbs"><strong>{{ formatNumber(improvedOrbs) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
  
  
  <script>
  import { calculateMultiplier, 
           calculateCupMultiplier,
           calculateAdditionalHours,
           calculateOrbs 
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
           handleCheckboxChange,
           getBorderColorClass,
           handleInputChange,
  } 
  from '../utils/helpers';

  import { mapGetters } from "vuex";
  import { boosts } from '../store/boosts';
  import FlatPickr from "vue-flatpickr-component";
  import "flatpickr/dist/themes/dark.css";
  
  export default {
    name: "OrbCalc",

    components: {
      FlatPickr,
    },

    data() {
      return {
        currentStats: {},
        improvedStats: {},
        catchupMultiplier: 1,
        improvedDate: null,
        datePickerValue: null, 
        isInstructionsModalVisible: false,
        isMobile: window.innerWidth < 600,
        flatpickrConfig: {
          enableTime: true,
          time_24hr: false,
          dateFormat: "Y-m-d H:00 K",
          minuteIncrement: 60,
          defaultMinute: 0,
          
          defaultDate: new Date(),
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
      currentOrbs() {
        const cupMultiplier = this.catchupMultiplier; // Wert aus Eingabefeld
        return calculateOrbs(this.currentStats, boosts, cupMultiplier);
      },
      improvedOrbs() {
        return calculateOrbs(this.improvedStats, boosts);
      },      
    },

    methods: {
      saveToLocalStorage() {
        saveToLocalStorage(this.currentStats, this.improvedStats, this.improvedDate, null, null);
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
      onInputChange(stats, key, max, referenceStats = null) {
        // Standardprüfung mit handleInputChange
        handleInputChange(stats, key, max, this.saveToLocalStorage);

        // Prüfen und korrigieren, falls ImprovedStats genutzt wird und der Wert kleiner als CurrentStats ist
        if (referenceStats && stats === this.improvedStats) {
          const minValue = referenceStats[key] || 0; // Mindestwert aus CurrentStats
          if (stats[key] < minValue) {
            stats[key] = minValue; // Korrigieren
            this.saveToLocalStorage();
          }
        }

        // Wenn CurrentStats geändert wird, verbessere den zugehörigen Wert in ImprovedStats
        if (stats === this.currentStats && this.improvedStats[key] < stats[key]) {
          this.improvedStats[key] = stats[key];
          this.saveToLocalStorage();
        }
      },
      onCatchupMultiplierChange() {
        const min = 1;
        const max = 2;

        // Begrenze den Wert auf den Bereich [1, 2]
        if (this.catchupMultiplier < min) {
          this.catchupMultiplier = min;
        } else if (this.catchupMultiplier > max) {
          this.catchupMultiplier = max;
        }

        // Begrenze auf zwei Nachkommastellen
        this.catchupMultiplier = parseFloat(this.catchupMultiplier.toFixed(4));

        // Speichere den Wert im LocalStorage
        localStorage.setItem('catchupMultiplier', this.catchupMultiplier);
      },
      handleCheckboxChange(key, type) {
        handleCheckboxChange(key, type, this.currentStats, this.improvedStats, this.saveToLocalStorage);
      },
      handleDateChange(selectedDate) {
        if (this.improvedDate === selectedDate) return; // Keine Aktion bei gleicher Auswahl

        this.improvedDate = selectedDate; // Globale Variable aktualisieren
        const additionalHours = calculateAdditionalHours(new Date(), selectedDate);
        const newImprovedHoursInTR = (this.currentStats.hoursInTR || 0) + additionalHours;

        // Aktualisiere die verbesserten Stunden nur, wenn sich der Wert unterscheidet
        if (this.improvedStats.hoursInTR !== newImprovedHoursInTR) {
          this.improvedStats.hoursInTR = newImprovedHoursInTR;
        }

        this.saveToLocalStorage(); // Speichern im LocalStorage
      },
      toggleInstructionsModal() {
        this.isInstructionsModalVisible = !this.isInstructionsModalVisible;
      },
      getImprovedCup() {
        return this.formatNumber(this.calculateCupMultiplier(this.improvedStats.hoursInTR));
      },
      checkIfMobile() {
        this.isMobile = window.innerWidth < 600;
      },

      calculateMultiplier, formatNumber, loadFromLocalStorage,  resetAllFields, calculateCupMultiplier, getBorderColorClass,
    },

    watch: {
      currentStats: {
        handler(newStats) {
          // Aktualisiere ImprovedStats bei Änderungen in CurrentStats
          Object.keys(newStats).forEach((key) => {
            if (this.improvedStats[key] < newStats[key]) {
              this.improvedStats[key] = newStats[key];
            }
          });
          
          this.saveToLocalStorage();
        },
        deep: true, // Überwacht alle tiefen Änderungen in currentStats
      },
      'currentStats.hoursInTR': function (newHoursInTR) {
        if (this.improvedDate) {
          const additionalHours = calculateAdditionalHours(new Date(), this.improvedDate);
          const newImprovedHoursInTR = (newHoursInTR || 0) + additionalHours;

          if (this.improvedStats.hoursInTR !== newImprovedHoursInTR) {
            this.improvedStats.hoursInTR = newImprovedHoursInTR;
            this.saveToLocalStorage();
          }
        }
      },
    },

    mounted() {
      const stats = loadOrInitializeStats(boosts);
      this.currentStats = { ...stats.currentStats };
      this.improvedStats = { ...stats.improvedStats };
      this.improvedDate = stats.improvedDate || new Date(); // Globale Variable initialisieren
      this.datePickerValue = this.improvedDate; // Lokale Kopie setzen
      this.updateImprovedStats();

      const storedMultiplier = localStorage.getItem('catchupMultiplier');
      if (storedMultiplier) {
        this.catchupMultiplier = parseFloat(storedMultiplier);
      }

      // Dynamische Erkennung bei Fensteränderungen
      window.addEventListener("resize", this.checkIfMobile);
    },
  };
  </script>
  