export function saveToLocalStorage(currentStats, improvedStats) {
  localStorage.setItem('currentStats', JSON.stringify(currentStats));
  localStorage.setItem('improvedStats', JSON.stringify(improvedStats));
}

export function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("orbCalculatorData"));
    if (data) {
      this.currentStats = data.currentStats || {};
      this.improvedStats = data.improvedStats || {};
      this.shorts = data.shorts || [];
    }
}

//Funktion zum Laden oder Initialisieren der Stats
export function loadOrInitializeStats(boosts) {
  const savedCurrentStats = localStorage.getItem('currentStats');
  const savedImprovedStats = localStorage.getItem('improvedStats');

  // Standardwerte initialisieren
  const defaultStats = Object.fromEntries(boosts.map((boost) => [boost.key, 0]));

  // Wenn Werte existieren, diese verwenden, ansonsten Standardwerte setzen
  const currentStats = savedCurrentStats ? JSON.parse(savedCurrentStats) : defaultStats;
  const improvedStats = savedImprovedStats ? JSON.parse(savedImprovedStats) : defaultStats;

  return { currentStats, improvedStats };
}

//Funktion zum Erhöhen der Werte von Current und Improved Stats
export function increaseValue(stats, key, max, saveCallback = () => {}) {
  // Initialisiere den Wert, falls nicht vorhanden
  if (stats[key] === undefined) {
      stats[key] = 0;
  }

  // Fallback für max, falls nicht definiert
  const effectiveMax = max > 0 ? max : Infinity;

  // Erhöhe den Wert nur, wenn unterhalb des Maximalwerts
  if (stats[key] < effectiveMax) {
      stats[key]++;
      saveCallback();
  }
}
  
//Funktion zum Senken der Werte von Current und Improved Stats  
export function decreaseValue(stats, key, min, saveCallback) {
    if (stats[key] > min) {
        stats[key]--;
        if (saveCallback) {
            saveCallback();
        }
    }
}

//Funktion zum Formatieren von Zahlen in k, m, b, t, etc...
export function formatNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        console.error(`Invalid value passed to formatNumber: ${value}`);
        value = 0;
    }

    const suffixes = ["", "k", "m", "b", "t", "qa", "qu", "sx", "sp", "oc", "n", "d"];
    let tier = Math.floor(Math.log10(value) / 3);
  
    if (tier === 0) {
      return value.toFixed(2);
    }
  
    if (tier >= suffixes.length) {
      return value.toExponential(2);
    }
  
    const suffix = suffixes[tier];
    const scaledValue = value / Math.pow(10, tier * 3);
  
    return `${scaledValue.toFixed(2)}${suffix}`;
}

//Funktion zum überprüfen von validen Eingaben  
export function validateInput(key) {
    if (!this.currentStats[key] || isNaN(this.currentStats[key])) {
      this.currentStats[key] = 0; // Setze Standardwert, wenn der Input leer oder ungültig ist
    }
    this.saveToLocalStorage();
}

//setzt alle Werte in currentStats und improvedStats auf 0
export function resetAllFields() {
    // Setzt alle Werte in currentStats und improvedStats auf 0
    Object.keys(this.currentStats).forEach((key) => {
      this.currentStats[key] = 0;
    });

    Object.keys(this.improvedStats).forEach((key) => {
      this.improvedStats[key] = 0;
    });

    this.saveToLocalStorage(); // Speichert die Änderungen im LocalStorage
}

//setzt die improvedStats auf die Werte der currentStats
export function ensureImprovedStatsMinimum(currentStats, improvedStats) {
  Object.keys(currentStats).forEach((key) => {
      if (improvedStats[key] < currentStats[key]) {
          improvedStats[key] = currentStats[key];
      }
  });
}

//begrenzt den Wert auf den maximalen Wert
export function clampValue(value, max) {
  return max !== undefined && max !== null ? Math.min(value, max) : value;
}

//verwaltet die Checkboxen
export function handleCheckboxChange(key, type, currentStats, improvedStats, saveCallback) {
  if (type === "current") {
    if (currentStats[key]) {
      // Wenn Current aktiviert wird, aktiviere auch Improved
      improvedStats[key] = true;
    } else {
      // Wenn Current deaktiviert wird, deaktiviere Improved nur, wenn es nicht explizit aktiviert wurde
      improvedStats[key] = false;
    }
  }

  if (type === "improved" && !improvedStats[key]) {
    // Wenn Improved deaktiviert wird, keine Auswirkungen auf Current
    improvedStats[key] = false;
  }

  if (saveCallback) {
    saveCallback();
  }
}
