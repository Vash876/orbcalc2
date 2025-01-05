<template>
  <div class="calculator-container">
    <!-- Dynamic Shorts Sections with Transition -->
    <div 
      v-for="(short, index) in shorts" 
      :key="index" 
      class="input-area" 
      :style="{ marginTop: index > 0 ? '15px' : '0' }"
    >
        <h2 class="short-title">
          {{ getShortTitle(index) }}
        </h2>
      <!-- Zeige TR Count und All-Time Orbs nur im ersten Fenster -->
      <div v-if="index === 0" class="boosts-inputs">

        <div class="boost-row">
          <button
            class="instructions-button"
            @click="toggleInstructionsModal"    
          >
            Instructions
          </button>
<button @click="resetAllFields" class="reset-button">Reset All Fields</button>
          <div v-if="isInstructionsModalVisible" class="modal-overlay" @click.self="toggleInstructionsModal">
            <div class="modal-content">
              <button class="modal-close" @click="toggleInstructionsModal">x</button>
              <h2>Shorts Planner Instructions</h2>
              <ul>
                <li>
                  <strong>TR Count:</strong> 
                  Type in the TR Count of your first planned Short TR.
                  <ul>
                    <li>If you are currently in a Long TR, type in your current TR Count + 1.</li>
                  </ul>
                </li>
                <li>
                  <strong>All-Time Orbs:</strong> 
                  Type in the All-Time Orbs of your first planned Short TR.
                  <ul>
                    <li>If you are currently in a Long TR, add your Current All-Time Orbs to your expected Orb Gains from the Long TR.</li>
                  </ul>
                </li>
                <li>
                  <strong>Start Date:</strong> 
                  Used to calculate the exact end of your Shorts.
                </li>
                <li>
                  <strong>Boost Selection:</strong> 
                  <ul>
                    <li>Use the checkbox on the right to adjust your Boosts in the following Shorts.</li>
                    <li>Boosts not selected will automatically apply to all following Shorts.</li>
                  </ul>
                </li>
                <li>
                  <strong>Status:</strong>
                  <ul>
                    <li><span style="color: green;">✅ Fulfilled:</span> Your plan meets the TR requirements.</li>
                    <li><span style="color: red;">❌ Missing:</span> The requirements are not met, and the missing Orbs will be displayed.</li>
                    <li>
                      If you do not meet the requirement, missing hours in TR will be displayed in the "Hours in TR" row.
                    </li>
                    <li>TR requirements below TR12 are wrong. If you have the correct formula, feel free to reach out to me on Discord.</li>
                  </ul>
                </li>
                <li>
                  <strong>Buttons:</strong>
                  <ul>
                    <li><strong>Add New Short:</strong> Adds a new row for planning the next Short. Disabled if the last Short is marked as <span style="color: red;">❌ Missing</span>.</li>
                    <li><strong>Remove Short:</strong> Removes the last added Short.</li>
                    <li><strong>Stats Button:</strong> Opens a detailed overview of your entire plan.</li>
                  </ul>
                </li>
                <li>
                  Smartphone users may switch to landscape mode for additional information.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="boost-row">
          <button @click="loadImprovedStatsToFirstShort" class="auto-button">
            Auto-Fill
          </button>
          
        </div>

        <div class="boost-row">
          <label for="trCount">TR Count</label>
          <button @click="decreaseValue()" tabindex="-1">-</button>
          <input
            type="number"
            v-model.number="shorts[0].trCount"
            id="trCount"
            placeholder="Enter TR Count"
            class="extra-input"
            tabindex="1"
             style="max-width: 40px;"
            @change="saveToLocalStorage"
          />
          <button @click="increaseValue()" tabindex="-1">+</button>
        </div>

        <div class="boost-row">
          <label for="allTimeOrbs">All-Time Orbs</label>
          <input
            type="text"
            v-model="allTimeOrbsInput"
            tabindex="2"
            @blur="validateAllTimeOrbsInput"
            @input="handleAllTimeOrbsTyping"
            @change="saveToLocalStorage"
            id="allTimeOrbs"
            placeholder="e.g., 4.5b"
            class="extra-input"
          />
        </div>

        <div class="boost-row">
          <label for="allTimeOrbs">Start Date</label>
          <flat-pickr
            v-model="startDate"
            id="datePicker"
            :config="flatpickrConfig"
            placeholder="Pick a date"
            class="date-picker"
            style="font-size: 9px;"
            tabindex="3"
            @onChange="handleDateChange"
            @change="saveToLocalStorage"
          ></flat-pickr>
        </div>
      </div>

      <!-- Eingabefelder (Numerische Boosts) -->
      <div class="boosts-inputs">
        <div
          v-for="(boost, bIndex) in getFilteredBoosts(index, 'number')"
          :key="boost.key"
          class="boost-row"
        > <label class="tooltip" style="margin-left: 0; margin-right: 15px;">
            <label>{{ boost.label }}</label>
            <span v-if="boost.tooltip != 0" class="tooltiptext">{{ boost.tooltip }}</span>
            <span v-if="boost.key === 'hoursInTR'" class="tooltiptext">
                  Enter hours or days (e.g., 6d). Days will be automatically converted to hours.
            </span>
          </label>
          <button @click="decreaseValue(index, boost.key, boost.max)" tabindex="-1">-</button>
          <input
            :type="boost.key === 'hoursInTR' ? 'text' : 'number'"
            v-model="short[boost.key]"
            :id="boost.key + '-' + index"
            :placeholder="'Value for ' + boost.label + (boost.key === 'hoursInTR' ? ' (e.g., 2d for days)' : '')"
            :max="boost.max || null"
            class="current-input"
            @input="onInputChange(short, boost.key, boost.max, index)"
            @blur="boost.key === 'hoursInTR' ? onHoursInTRBlur(short, boost.key) : onInputChange(short, boost.key, boost.max, index, null)"
            :tabindex="calculateTabIndex(index, bIndex)"
          />
          <button @click="increaseValue(index, boost.key, boost.max)" tabindex="-1">+</button>

          <!-- Checkbox for including Boost in further Shorts -->
          <template v-if="index === 0">
            <input
              type="checkbox"
              v-model="boostSelection[boost.key]"
              class="current-checkbox"
              tabindex="-1"
              :checked="boost.key === 'hoursInTR'"
              :disabled="boost.key === 'hoursInTR' || checkAndHandleBoostSelection(boost)"
              @change="checkAndHandleBoostSelection(boost)"
            />
          </template>

          <!-- Multiplier Display -->              
          <!-- nur desktop -->
          <div v-if="!isMobile">
            <span  class="shortmulti-display">
              {{ formatNumber(calculateMultiplier(boost, short[boost.key], short)) }}
            </span>
          </div>            

          <!-- Missing Hours -->
          <template v-if="boost.key === 'hoursInTR' && !isMobile">
            <span v-if="getMissingHours(index) > 1000" class="missing-hours">
              Time for a Long TR
            </span>
            <span v-else-if="getMissingHours(index) > 0" class="missing-hours">
              Missing Hours: {{ getMissingHours(index) }}
            </span>
          </template>
        </div>
      </div>


      <!-- Checkboxen (Boolean Boosts) -->
      <div class="checkbox-inputs">
        <div
          v-for="(boost, bIndex) in getFilteredBoosts(index, 'boolean')"
          :key="boost.key"
          class="boost-row"
        >
          <label>{{ boost.label }}</label>
          <input
            type="checkbox"
            v-model="short[boost.key]"
            :id="boost.key"
            class="current-checkbox"
            :tabindex="calculateTabIndex(index, bIndex, true)"
            @change="saveToLocalStorage"
          />
          <!-- Checkbox for including Boost in further Shorts -->
          <template v-if="index === 0">
            <input
              type="checkbox"
              v-model="boostSelection[boost.key]"
              class="current-checkbox2"
              tabindex="-1"
              :disabled="checkAndHandleBoostSelection(boost)"
              @change="checkAndHandleBoostSelection(boost)"
            />
          </template>

          <!-- Multiplier Display -->              
          <!-- nur desktop -->
          <div v-if="!isMobile">
            <span 
              class="shortmulti-display"
              :style="index > 0 ? { marginLeft: '43px' } : {}">
              {{ formatNumber(calculateMultiplier(boost, short[boost.key], short)) }}
            </span>
          </div>   
        </div>
        <div>
        <table class="short-results-table">
          <thead>
            <tr>
              <th>TR Req</th>
              <th>Orb Gains</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TR {{ getTRCount(index) }} Req: {{ formatNumber(getTRRequirement(index) || 0) }}</td>
              <td>{{ formatNumber(getOrbGains(index)) }}</td>
              <td :class="getStatus(index).status === 'Missing' ? 'text-red' : 'text-green'">
                <div class="status-container">
                  <span v-if="getStatus(index).status === 'Fullfilled'" class="status-icon">✅</span>
                  <span v-else-if="getStatus(index).status === 'Missing'" class="status-icon">❌</span>
                  <template v-if="getStatus(index).status === 'Missing'">
                    ({{ formatNumber(getStatus(index).missing) }})
                  </template>
              </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>

    <div class="short-buttons-container">
      <!-- Remove Short Button -->
      <button
        v-if="shorts.length > 1"
        @click="removeShort(index)"
        class="remove-short-button"
      >
        Remove Short
      </button>

      <button class="stats-button" @click="toggleStatsModal">View Results</button>

      <!-- Add New Short Button -->
      <button
        v-if="shorts.length < 10"
        :disabled="isLastShortMissing"
        @click="addNewShort"
        class="add-short-button"
      >
        Add New Short
      </button>

      <!-- Modal -->
      <div v-if="showStatsModal" class="modal-overlay" @click.self="toggleStatsModal">
        <div class="modal-content">
          <button class="modal-close" @click="toggleStatsModal">X</button>
          <h2>Results</h2>

          <table class="stats-results">
            <thead>
              <tr>
                <th>TR#</th>
                <th>Req</th>
                <th>Start Date</th>
                <th>Accumulated Orbs</th>
                <th>All-Time Orbs</th>
                <th>Orbs / Hour</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(short, index) in statsData.filter((_, i) => getStatus(i).status === 'Fullfilled')"
                :key="index"
                :class="{ 'row-missing': getStatus(index).status === 'Missing' }"
              >
                <td>TR{{ getTRCount(index) }}</td>
                <td>{{ formatNumber(getTRRequirement(index)) }}</td>
                <td v-html="getFormattedStartDate(index)">
                  
                </td>
                <td>
                <span v-if="index === 0">
                  0
                </span>
                <span v-else>
                  {{ formatNumber(getAvailableOrbs(index - 1)) }}
                </span>
                <span> (+{{ formatNumber(getOrbGains(index)) }})</span>
              </td>
              <td>
                {{ formatNumber(getAllTimeOrbs(index)) }}
              </td>
              <td>
                {{ formatNumber(calculateOrbsPerHour(index)) }}
              </td>
            </tr>

              <!-- Zusätzliche End Result Zeile -->
              <tr>
                <td colspan="2">
                  <b>End Result:</b>
                </td>
                <td colspan="1" class="next-start-date">
                  <b v-if="getStatus(statsData.length - 1).status !== 'Missing'" v-html="getFormattedStartDate(statsData.length)"></b>
                  <b v-else v-html="getFormattedStartDate(statsData.length - 1)"></b>
                </td>
                <td colspan="1">
                  <b v-if="getStatus(statsData.length - 1).status !== 'Missing'">
                    {{ formatNumber(getAvailableOrbs(statsData.length - 1)) }}
                  </b>
                  <b v-else>
                    {{ formatNumber(getAvailableOrbs(statsData.length - 2)) }}
                  </b>
                </td>
                <td colspan="1">
                  <b v-if="getStatus(statsData.length - 1).status !== 'Missing'">
                    {{ formatNumber(getAllTimeOrbs(statsData.length)) }}
                  </b>
                  <b v-else> 
                    {{ formatNumber(getAllTimeOrbs(statsData.length - 1)) }}
                  </b>
                </td>
                <td colspan="1">
                  <b>{{ formatNumber(calculateTotalOrbsPerHour(statsData.length)) }}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import {
  loadOrInitializeStats,
  saveToLocalStorage,
  increaseValue,
  decreaseValue,
  formatNumber,
  handleInputChange,
  resetAllFields,
  validateAllTimeOrbsInput,
} from "../utils/helpers";
import { calculateMultiplier, calculateOrbs, calculateOrbRequirement, calculateMissingHours } from "../utils/calculations";
import { mapGetters } from "vuex";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/themes/dark.css";

export default {
  name: "ShortsPlanner",

  components: {
    FlatPickr,
  },

  data() {
    return {
      improvedStats: {},
      shorts: [],
      boostSelection: {},
      startDate: new Date(),
      allTimeOrbsInput: "",
      isMobile: window.innerWidth < 600,
      isInstructionsModalVisible: false,
      showStatsModal: false,
      flatpickrConfig: {
        enableTime: true,
        dateFormat: "Y-m-d h:00 K", // Dynamische Zeitangabe (Stunde und Minute)
        time_24hr: false, // Für 12-Stunden-Format mit AM/PM
        minuteIncrement: 60, // Stundenweise inkrementieren
        defaultHour: new Date().getHours(), // Standardstunde auf die aktuelle Stunde setzen
        defaultMinute: 0, // Minuten standardmäßig auf 0 setzen
        defaultDate: new Date(new Date().setMinutes(0)), // Aktuelles Datum und Zeit als Standardwert
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
    isLastShortMissing() {
      if (this.shorts.length === 0) {
        // Wenn keine Fenster vorhanden sind, kann der Button aktiv bleiben
        return false;
      }
      const lastShortIndex = this.shorts.length - 1; // Index des letzten Fensters
      const status = this.getStatus(lastShortIndex); // Status des letzten Fensters abrufen
      return status?.status === "Missing"; // Button deaktivieren, wenn Status "Missing" ist
    },
    statsData() {
      return this.shorts; // Hier basieren wir die Tabelle auf den Short-Fenstern
    },
  },

  methods: {
    initializeBoostSelection() {
      return this.getBoosts.reduce((selection, boost) => {
        selection[boost.key] = false;
        return selection;
      }, {});
    },
    saveToLocalStorage() {
      if (this.shorts.length > 0) {
        this.shorts[0].trCount = this.shorts[0].trCount || 0;
        this.shorts[0].allTimeOrbs = this.shorts[0].allTimeOrbs || 0;
        this.shorts[0].startDate = this.shorts[0].startDate || null;
      }

      saveToLocalStorage(null, null, null, this.shorts, this.boostSelection);
    },
    addNewShort() {
      const defaultStats = Object.fromEntries(this.getBoosts.map((boost) => [boost.key, 0]));

      // Übernehme Werte aus dem zuletzt geöffneten Fenster, falls vorhanden
      const lastShort = this.shorts.length > 0 ? this.shorts[this.shorts.length - 1] : {};

      const newShort = {
        ...defaultStats, // Initialisiere alle Boost-Werte mit 0
        ...lastShort, // Übernehme Werte aus dem zuletzt geöffneten Fenster
      };

      this.shorts.push(newShort);
      this.saveToLocalStorage();
    },
    removeShort() {
      if (this.shorts.length > 0) {
        const updatedShorts = [...this.shorts];
        updatedShorts.pop();
        saveToLocalStorage(null, null, null, updatedShorts, this.boostSelection);
        this.shorts.pop();
      }
    },
    increaseValue(index = null, key = null, max = null) {
    if (index === null && key === null) {
      // Standardfall für trCount
      this.shorts[0].trCount = (this.shorts[0].trCount || 0) + 1;
      this.saveToLocalStorage();
    } else {
      // Standardfall für Boosts
      increaseValue(this.shorts[index], key, max, this.saveToLocalStorage);
      this.syncPermanentBoosts(index, key);
    }
    },
    decreaseValue(index = null, key = null) {
      if (index === null && key === null) {
        // Standardfall für trCount
        if (this.shorts[0].trCount > 0) {
          this.shorts[0].trCount--;
          this.saveToLocalStorage();
        }
      } else {
        // Standardfall für Boosts
        const boost = this.getBoosts.find((b) => b.key === key);
        const lowerValue = this.shorts[index][key];

        if (boost?.permanent === 1 && index > 0) {
          const upperValue = this.shorts[index - 1][key];
          if (lowerValue <= upperValue) {
            return;
          }
        }

        decreaseValue(this.shorts[index], key, 0, this.saveToLocalStorage);
      }
    },
    onHoursInTRBlur(short, key) {
      let value = short[key];

      if (typeof value === "string" && value.endsWith("d")) {
        const days = parseInt(value.replace("d", ""), 10);
        value = isNaN(days) ? 0 : days * 24;
      } else if (!isNaN(value) && value !== null && value !== "") {
        value = parseInt(value, 10); // Sicherstellen, dass es eine Ganzzahl ist
      } else {
        value = 0; // Zurücksetzen auf 0 bei leerem oder ungültigem Wert
      }

      // Aktualisiere den Wert
      short[key] = value;
      this.saveToLocalStorage();
    },
    onInputChange(stats, key, max, index, event = null) {
      if (!this.shorts || !this.shorts[index]) {
        return;
      }

      const boost = this.getBoosts.find((b) => b.key === key);
      let value = stats[key];

      // Spezielle Verarbeitung für `hoursInTR`
      if (key === "hoursInTR") {
        if (typeof value === "string" && value.endsWith("d")) {
          // Konvertiere Tage in Stunden
          const days = parseInt(value.replace("d", ""), 10);
          value = isNaN(days) ? 0 : days * 24;
        } else if (!isNaN(value)) {
          // Stelle sicher, dass es eine Ganzzahl ist
          value = parseInt(value, 10);
        } else {
          value = 0; // Ungültige Eingaben auf 0 setzen
        }
        stats[key] = value; // Speichere den bereinigten Wert
      }

      // Automatische Berechnung bei Änderungen
      if (key === "hoursInTR" || this.getStatus(index).status.startsWith("Missing")) {
        this.getMissingHours(index);
      }

      if (boost?.permanent === 1 && index > 0) {
        const upperValue = this.shorts[index - 1][key];

        if (event === null && value < upperValue) {
          stats[key] = upperValue;
          this.saveToLocalStorage();
          return;
        }
      }

      handleInputChange(stats, key, max, this.saveToLocalStorage);
      this.syncPermanentBoosts(index, key);
    },
    getFilteredBoosts(index, type) {
      return index === 0
        ? this.getBoosts.filter((boost) => boost.type === type)
        : this.getBoosts.filter((boost) => this.boostSelection[boost.key] && boost.type === type);
    },
    getShortTitle(index) {
      return `Short #${index + 1}`;
    },
    handleDateChange(selectedDate) {
      if (this.shorts[0].startDate !== selectedDate) {
        this.shorts[0].startDate = selectedDate;
        this.saveToLocalStorage();
      }
    },
    calculateTabIndex(shortIndex, boostIndex, isCheckbox = false) {
      // Anzahl der Boosts
      const totalBoosts = this.getBoosts.length;

      // Anzahl der Checkboxen in jedem Fenster (Checkboxen kommen nach allen Nummern-Feldern)
      const checkboxOffset = isCheckbox ? totalBoosts : 0;

      // Anzahl der ausgewählten BoostSelection-Checkboxen (nur für das erste Fenster)
      const boostSelectionCount = Object.values(this.boostSelection || {}).filter(Boolean).length;

      // Baseline für das erste Fenster
      let baseTabIndex = 4;

      // Für spätere Fenster: Addiere die vorherigen Boosts + BoostSelection
      if (shortIndex > 0) {
        baseTabIndex += shortIndex * (totalBoosts + boostSelectionCount);
      }

      // Tabindex für das aktuelle Feld (mit Offset für Checkboxen)
      return baseTabIndex + boostIndex + checkboxOffset;
    },
    loadImprovedStatsToFirstShort() {
      const existingData = JSON.parse(localStorage.getItem("orbCalculatorData"));

      if (existingData && existingData.improvedStats) {
        for (const key in existingData.improvedStats) {
          if (key !== "hoursInTR" && Object.prototype.hasOwnProperty.call(this.shorts[0], key)) {
            this.shorts[0][key] = existingData.improvedStats[key];
          }
        }

        if (existingData.improvedDate) {
          this.shorts[0].startDate = existingData.improvedDate;
          this.startDate = existingData.improvedDate;
        }

        this.saveToLocalStorage();
      }
    },
    checkAndHandleBoostSelection(boost) {
      const isDisabled = (() => {
        if (boost.expand === "0") {
          if (boost.type === "boolean" && this.shorts[0]?.[boost.key] === true) {
            return true;
          }
          if (
            boost.type === "number" &&
            boost.max !== undefined &&
            this.shorts[0]?.[boost.key] >= boost.max
          ) {
            return true;
          }
        }
        return false;
      })();

      if (boost.key === "hoursInTR") {
        this.boostSelection[boost.key] = true; // Erzwinge den Wert auf true
        return isDisabled;
      }

      // Wenn die Boost Selection aktiviert wird, synchronisiere Werte
      if (this.boostSelection[boost.key]) {
        this.shorts.forEach((short, index) => {
          if (index > 0 && short[boost.key] === undefined) {
            short[boost.key] = this.shorts[0][boost.key]; // Synchronisiere nur, wenn noch kein Wert vorhanden ist
          }
        });
      }

      // Beim Deaktivieren lösche den Wert nur aus Boost Selection
      if (!this.boostSelection[boost.key]) {
        this.shorts.forEach((short, index) => {
          if (index > 0) {
            delete short[boost.key]; // Entferne den Wert, um ihn vollständig freizugeben
          }
        });
      }

      this.saveToLocalStorage(); // Speichere die Änderungen
      return isDisabled; // Gibt zurück, ob die Checkbox deaktiviert sein sollte
    },
    syncPermanentBoosts(index, key) {
      const boost = this.getBoosts.find((b) => b.key === key);
      if (boost && boost.permanent === 1) {
        const updatedValue = this.shorts[index][key];
        for (let i = index + 1; i < this.shorts.length; i++) {
          if (this.shorts[i][key] < updatedValue) {
            this.shorts[i][key] = updatedValue;
          }
        }
        this.saveToLocalStorage();
      }
    },
    handleAllTimeOrbsTyping(event) {
      this.allTimeOrbsInput = event.target.value;
    },
    validateAllTimeOrbsInput() {
      try {
        const input = this.allTimeOrbsInput.trim().toLowerCase();
        const parsedValue = validateAllTimeOrbsInput(input);

        if (!isNaN(parsedValue) && parsedValue >= 0) {
          this.shorts[0].allTimeOrbs = parsedValue;
          this.allTimeOrbsInput = parsedValue > 0 ? formatNumber(parsedValue) : "0.00";
          this.saveToLocalStorage();
        } else {
          throw new Error("Ungültige Eingabe");
        }
      } catch (error) {
        this.allTimeOrbsInput = "0.00";
        this.shorts[0].allTimeOrbs = 0;
        this.saveToLocalStorage();
      }
    },
    getTRCount(index) {
      return parseInt(this.shorts[0]?.trCount || 0) + index;
    },
    getTRRequirement(index) {
      const baseAllTimeOrbs = parseFloat(this.shorts[0]?.allTimeOrbs || 0);

      // Summiere die Orb Gains aus allen vorherigen Fenstern
      let totalOrbGains = 0;
      for (let i = 0; i < index; i++) {
        totalOrbGains += this.getOrbGains(i);
      }

      // Addiere die gesammelten Orb Gains zu den All-Time Orbs
      const allTimeOrbs = baseAllTimeOrbs + totalOrbGains;

      // Berechne das Requirement basierend auf TR Count und All-Time Orbs
      return calculateOrbRequirement(this.getTRCount(index), allTimeOrbs);
    },
    getOrbGains(index) {
      const shortValues = this.shorts[index];
      const boostValues = {};

      this.getBoosts.forEach((boost) => {
        const isSelected = this.boostSelection[boost.key] === true; // Prüfe explizit auf true

        if (isSelected) {
          // Nutze den Wert aus dem aktuellen Fenster
          boostValues[boost.key] = shortValues[boost.key];
        } else {
          // Fallback auf das erste Short-Fenster
          boostValues[boost.key] = this.shorts[0][boost.key]; // Sicherstellen, dass 0 der Standardwert ist
        }
      });

      return calculateOrbs(boostValues, this.getBoosts);
    },
    getStatus(index) {
      const orbGains = this.getOrbGains(index);
      const trRequirement = this.getTRRequirement(index);

      if (orbGains >= trRequirement) {
        return { status: "Fullfilled", missing: 0 }; // Keine fehlenden Orbs
      } else {
        const missing = trRequirement - orbGains;
        return { status: "Missing", missing }; // Roher Wert der fehlenden Orbs
      }
    },
    updateCalculations() {
      this.saveToLocalStorage();
    },
    isFullfilled(index) {
      const orbGains = this.getOrbGains(index);
      const trRequirement = this.getTRRequirement(index);
      return orbGains >= trRequirement;
    },
    syncBoostsFromFirstShort() {
      const firstShort = this.shorts[0];

      if (!firstShort) return;

      // Iteriere über alle Fenster außer dem ersten
      this.shorts.forEach((short, index) => {
        if (index === 0) return; // Überspringe das erste Fenster

        Object.keys(firstShort).forEach((key) => {
          // Übernimm Werte aus dem ersten Fenster, falls BoostSelection deaktiviert ist
          if (!this.boostSelection[key]) {
            short[key] = firstShort[key];
          }
        });
      });

      this.saveToLocalStorage(); // Speichere die Änderungen
    },
    getMissingHours(index) {
      const statusInfo = this.getStatus(index);

      if (statusInfo.status === "Missing" && statusInfo.missing > 0) {
        const currentHoursInTR = this.shorts[index]?.hoursInTR || 0;

        return calculateMissingHours(
          currentHoursInTR,
          this.getTRRequirement(index),
          this.calculateOrbsWithHours.bind(this),
          this.getBoosts,
          index
        );
      }

      return 0; // Keine fehlenden Stunden
    },
    calculateOrbsWithHours(hours, boosts, index) {
      const updatedValues = {
        ...this.shorts[0], // Werte aus dem ersten Short übernehmen
        ...this.shorts[index], // Werte aus dem aktuellen Short
        hoursInTR: hours, // Aktualisierte Stunden für die Berechnung
      };

      return calculateOrbs(updatedValues, boosts);
    },
    checkIfMobile() {
      this.isMobile = window.innerWidth < 600;
    },
    toggleInstructionsModal() {
      this.isInstructionsModalVisible = !this.isInstructionsModalVisible;
    },
    //////////////////// Tabelle ////////////////////
    toggleStatsModal() {
      this.showStatsModal = !this.showStatsModal;
    },
    getFormattedStartDate(index) {
      // Nutze das aktuelle Datum, falls kein Startdatum gesetzt ist
      const fallbackDate = new Date();

      // Hole das Datum, entweder das aktuelle oder ein berechnetes
      const relevantDate = index === 0 
        ? this.startDate || fallbackDate 
        : this.getEndDate(index - 1) || fallbackDate;

      const formattedDate = this.formatDate(relevantDate);

      // Fallback prüfen, falls match null zurückgibt
      const match = formattedDate.match(/(.*)\s(\d{1,2}:\d{2}\s[AP]M)/);

      if (!match) {
        return formattedDate; // Gib das gesamte Datum zurück, wenn das Format nicht übereinstimmt
      }

      const [, date, timeWithMeridian] = match;

      // Kombiniere Datum und Zeit mit einem Zeilenumbruch
      return `${date}<br>${timeWithMeridian}`;
    },
    getAvailableOrbs(index) {
      if (index === 0) {
        return this.getOrbGains(index);
      }
      return this.getAvailableOrbs(index - 1) + this.getOrbGains(index);
    },
    getAllTimeOrbs(index) {
      const baseAllTimeOrbs = parseFloat(this.shorts[0]?.allTimeOrbs || 0);
      if (index === 0) {
        return baseAllTimeOrbs;
      }
      return this.getAllTimeOrbs(index - 1) + this.getOrbGains(index-1);
    },
    calculateOrbsPerHour(index) {
      // Start- und Enddatum für den aktuellen Index
      const startDate = index === 0 ? new Date(this.startDate) : new Date(this.getEndDate(index - 1));
      const endDate = new Date(this.getEndDate(index));
      console.log("Start Date:", startDate, "End Date:", endDate);
      // Berechnung der Gesamtstunden
      const totalHours = (endDate - startDate) / (1000 * 60 * 60); // Millisekunden -> Stunden
      if (totalHours <= 0) {
        console.log(`Invalid total hours for index ${index}:`, totalHours);
        return 0;
      }

      // Orb-Gains für den aktuellen Index
      const orbGains = this.getOrbGains(index);

      // Orbs pro Stunde berechnen
      const orbsPerHour = orbGains / totalHours;
      console.log(`Index: ${index}, Orbs: ${orbGains}, Hours: ${totalHours}, Orbs/Hour: ${orbsPerHour}`);
      return orbsPerHour;
    },
    calculateTotalOrbsPerHour() {
      // Suche den letzten Short, der den Status "Fullfilled" hat
      const lastFullfilledIndex = this.shorts
        .map((_, index) => index) // Erstelle eine Liste von Indizes
        .reverse() // Durchlaufe sie rückwärts
        .find(index => this.getStatus(index).status === "Fullfilled"); // Finde den letzten erfüllten Short

      if (lastFullfilledIndex === undefined) {
        console.log("No Fullfilled Shorts found.");
        return "N/A"; // Keine gültigen Shorts gefunden
      }

      // Startdatum aus dem Datepicker
      const startDate = new Date(this.startDate);
      // Enddatum des letzten erfüllten Shorts
      const endDate = new Date(this.getEndDate(lastFullfilledIndex));

      console.log("Start Date:", startDate, "End Date:", endDate);

      // Stunden zwischen Start- und Enddatum berechnen
      const totalHours = (endDate - startDate) / (1000 * 60 * 60);
      if (totalHours <= 0) {
        console.log("Invalid total hours:", totalHours);
        return "N/A";
      }

      // Gesamt-Orb-Gains mit getAvailableOrbs berechnen
      const totalOrbGains = this.getAvailableOrbs(lastFullfilledIndex);
      console.log("Total Orb Gains from getAvailableOrbs:", totalOrbGains, "Total Hours:", totalHours);

      // Orbs/Hour berechnen
      const result = totalOrbGains / totalHours;
      console.log("Total Orbs/Hour Result:", result);

      return result;
    },
    formatDate(date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate)) {
        return "Invalid Date"; // Fallback bei ungültigem Datum
      }

      const optionsDate = {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      };

      const optionsTime = {
        hour: "2-digit",
        minute: "2-digit",
      };

      // Datum und Uhrzeit getrennt formatieren
      const formattedDate = parsedDate.toLocaleDateString("en-US", optionsDate);
      const formattedTime = parsedDate
        .toLocaleTimeString("en-US", optionsTime)
        .replace(/(:\d{2})( AM| PM)/, ':00$2'); // Minuten manuell auf 00 setzen

      // Mit Zeilenumbruch zurückgeben
      return `${formattedDate} ${formattedTime}`;
    },
    getEndDate(index) {
  const fallbackDate = new Date(); // Standard auf das aktuelle Datum setzen
  const startDate = new Date(index === 0 ? this.startDate || fallbackDate : this.getEndDate(index - 1));
  const hoursToAdd = this.shorts[index]?.hoursInTR || 0;

  // Fallback für ungültige oder leere Startdaten
  if (isNaN(startDate)) {
    return fallbackDate; // Nutze das aktuelle Datum, wenn das Startdatum ungültig ist
  }

  startDate.setHours(startDate.getHours() + hoursToAdd);
  return startDate;
},


    resetAllFields,
    formatNumber, calculateMultiplier,
  },
  watch: {
    boostSelection: {
      handler() {
        this.shorts.forEach((_, index) => {
          if (index > 0) {
            this.syncBoostsFromFirstShort(index);
          }
        });
        this.saveToLocalStorage();
      },
      deep: true, // Überwacht Änderungen in BoostSelection
    },

    "shorts[0]": {
      handler() {
        this.shorts.forEach((_, index) => {
          if (index > 0) {
            this.syncBoostsFromFirstShort(index);
          }
        });
        this.saveToLocalStorage();
      },
      deep: true, // Überwacht Änderungen im ersten Fenster
    },

    shorts: {
      handler(newShorts) {
        newShorts.forEach((short, index) => {
          this.getMissingHours(index);
        });
      },
      deep: true,
    },
  },

  mounted() {
    const stats = loadOrInitializeStats(this.getBoosts);
    this.improvedStats = stats.improvedStats;
    this.shorts = stats.shorts;
    this.boostSelection = stats.boostSelection;

    if (!this.boostSelection.hoursInTR) {
      this.boostSelection.hoursInTR = true;
    }

    if (this.shorts.length > 0) {
      this.startDate = this.shorts[0].startDate;
      this.allTimeOrbsInput =
        this.shorts[0].allTimeOrbs > 0 ? formatNumber(this.shorts[0].allTimeOrbs) : "0.00";

      // Synchronisiere Boosts für alle zusätzlichen Fenster
      this.syncBoostsFromFirstShort();
    }

    // Dynamische Erkennung bei Fensteränderungen
    window.addEventListener("resize", this.checkIfMobile);
  },
};
</script>
