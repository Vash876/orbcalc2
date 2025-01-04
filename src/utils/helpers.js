export function saveToLocalStorage(currentStats, improvedStats, improvedDate, shorts, boostSelection) {
  const existingData = JSON.parse(localStorage.getItem("orbCalculatorData")) || {};

  if (shorts && shorts.length > 0) {
    shorts[0].trCount = shorts[0].trCount || 0;
    shorts[0].allTimeOrbs = shorts[0].allTimeOrbs || 0;
    shorts[0].selectedDate = shorts[0].selectedDate || null;
  }

  const newData = {
    currentStats: currentStats !== null ? currentStats : existingData.currentStats,
    improvedStats: improvedStats !== null ? improvedStats : existingData.improvedStats,
    improvedDate: improvedDate !== null ? improvedDate : existingData.improvedDate,
    shorts: shorts !== null ? shorts : existingData.shorts,
    boostSelection: boostSelection !== null ? boostSelection : existingData.boostSelection,
  };

  localStorage.setItem("orbCalculatorData", JSON.stringify(newData));
}

export function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("orbCalculatorData")) || {};
  const shorts = data.shorts || [];

  // Werte aus `shorts[0]` extrahieren (falls vorhanden)
  const trCount = shorts[0]?.trCount ?? 0;
  const allTimeOrbs = shorts[0]?.allTimeOrbs ?? 0;
  const selectedDate = shorts[0]?.selectedDate ?? null;

  return {
    currentStats: data.currentStats || {},
    improvedStats: data.improvedStats || {},
    shorts: shorts,
    boostSelection: data.boostSelection || {},
    trCount,
    allTimeOrbs,
    selectedDate,
  };
}

//Funktion zum Laden oder Initialisieren der Stats
export function loadOrInitializeStats(boosts) {
  const savedData = localStorage.getItem('orbCalculatorData');
  const defaultStats = Object.fromEntries(boosts.map((boost) => [boost.key, 0]));

  if (savedData) {
    const parsedData = JSON.parse(savedData);
    const shorts = parsedData.shorts || [defaultStats];

    // Sicherstellen, dass `shorts[0]` existiert
    if (!shorts[0]) {
      shorts[0] = { ...defaultStats };
    }

    // Zusätzliche Werte in `shorts[0]` integrieren
    shorts[0].trCount = shorts[0].trCount || 0;
    shorts[0].allTimeOrbs = shorts[0].allTimeOrbs || 0;
    shorts[0].selectedDate = shorts[0].selectedDate || null;

    return {
      currentStats: parsedData.currentStats || defaultStats,
      improvedStats: parsedData.improvedStats || defaultStats,
      improvedDate: parsedData.improvedDate || null, // Hinzufügen von improvedDate
      shorts,
      boostSelection: parsedData.boostSelection || boosts.reduce((selection, boost) => {
        selection[boost.key] = false;
        return selection;
      }, {}),
    };
  }

  // Standardwerte initialisieren
  const defaultShorts = [{ ...defaultStats, trCount: 0, allTimeOrbs: 0, selectedDate: null }];
  return {
    currentStats: defaultStats,
    improvedStats: defaultStats,
    improvedDate: null, // Standardwert für improvedDate
    shorts: defaultShorts,
    boostSelection: boosts.reduce((selection, boost) => {
      selection[boost.key] = false;
      return selection;
    }, {}),
  };
}

// Funktion zum Erhöhen der Werte bei den +-Buttons
export function increaseValue(stats, key, max, saveCallback = () => {}) {
  // Initialisiere den Wert, falls nicht vorhanden
  if (stats[key] === undefined) {
    stats[key] = 0;
  }

  // Fallback für max, falls nicht definiert
  const effectiveMax = max > 0 ? max : Infinity;

  if (key === "loopMods") {
    // Wenn nicht bereits ein Vielfaches von 500, auf das nächste runden
    if (stats[key] % 500 !== 0) {
      const nextMultipleOf500 = Math.ceil(stats[key] / 500) * 500;
      if (nextMultipleOf500 <= effectiveMax) {
        stats[key] = nextMultipleOf500;
        saveCallback();
        return;
      }
    }

    // Danach in 500er-Schritten erhöhen
    if (stats[key] + 500 <= effectiveMax) {
      stats[key] += 500;
      saveCallback();
    }
    return;
  }

  // Standard-Inkrement für andere Werte
  if (stats[key] + 1 <= effectiveMax) {
    stats[key] += 1;
    saveCallback();
  }
}

// Funktion zum Senken der Werte bei den +-Buttons
export function decreaseValue(stats, key, min, saveCallback) {
  // Initialisiere den Wert, falls nicht vorhanden
  if (stats[key] === undefined) {
    stats[key] = 0;
  }

  if (key === "loopMods") {
    // Wenn nicht bereits ein Vielfaches von 500, auf das vorherige runden
    if (stats[key] % 500 !== 0) {
      const previousMultipleOf500 = Math.floor(stats[key] / 500) * 500;
      if (previousMultipleOf500 >= min) {
        stats[key] = previousMultipleOf500;
        saveCallback();
        return;
      }
    }

    // Danach in 500er-Schritten verringern
    if (stats[key] - 500 >= min) {
      stats[key] -= 500;
      saveCallback();
    }
    return;
  }

  // Standard-Dekrement für andere Werte
  if (stats[key] - 1 >= min) {
    stats[key] -= 1;
    saveCallback();
  }
}

//Funktion zum Formatieren von Zahlen in k, m, b, t, etc...
export function formatNumber(value) {
    if (typeof value !== 'number' || isNaN(value) || value === 0) {
      return "0.00";
    }

    if (value === 0) {
      return "0.00"; // Gebe direkt 0.00 zurück, keine weiteren Berechnungen
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
  // Setzt alle Werte in currentStats auf 0, falls vorhanden
  if (this.currentStats) {
    Object.keys(this.currentStats).forEach((key) => {
      this.currentStats[key] = 0;
    });
  }

  // Setzt alle Werte in improvedStats auf 0, falls vorhanden
  if (this.improvedStats) {
    Object.keys(this.improvedStats).forEach((key) => {
      this.improvedStats[key] = 0;
    });
  }

  // Setzt die shorts-Liste auf ein einzelnes leeres Fenster zurück
  if (this.shorts && Array.isArray(this.shorts)) {
    const firstShort = this.shorts[0] || {};
    this.shorts = [
      Object.keys(firstShort).reduce((resetShort, key) => {
        if (typeof firstShort[key] === "number") {
          resetShort[key] = 0; // Setze numerische Werte auf 0
        } else if (typeof firstShort[key] === "boolean") {
          resetShort[key] = false; // Setze boolean-Werte auf false
        } else if (key === "selectedDate") {
          resetShort[key] = null; // Setze das Datum auf null
        }
        return resetShort;
      }, {}),
    ];
  }

  // Setzt boostSelection auf false, falls vorhanden
  if (this.boostSelection) {
    Object.keys(this.boostSelection).forEach((key) => {
      this.boostSelection[key] = key === 'hoursInTR' ? true : false;
    });
  }

  // Setzt die sichtbare Eingabe und den internen Wert von allTimeOrbs zurück
  if (this.allTimeOrbsInput !== undefined) {
    this.allTimeOrbsInput = "0"; // Sichtbare Eingabe zurücksetzen
  }
  if (this.shorts && this.shorts[0]) {
    this.shorts[0].allTimeOrbs = 0; // Interner Wert zurücksetzen
  }

  // Speichert die Änderungen im LocalStorage
  if (this.saveToLocalStorage) {
    this.saveToLocalStorage();
  }
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

//sorgt dafür, dass die Werte in improvedStats nicht unter den Werten in currentStats fallen
export function handleInputChange(stats, key, max, saveCallback) {
  const value = stats[key];
  const clampedValue = clampValue(value, max);

  // Vorläufige Eingabe speichern, ohne sofort zu berichtigen
  stats[key] = clampedValue;

  if (saveCallback) {
    saveCallback();
  }
}

//überprüft die Eingabe, wenn das Input-Feld verlassen wird
export function handleInputBlur(currentStats, improvedStats, key, saveCallback) {
  if (improvedStats[key] < currentStats[key]) {
    improvedStats[key] = currentStats[key];
    if (saveCallback) {
      saveCallback();
    }
  }
}

//ändert den Rand des Eingabefeldes je nach Wert
export function getBorderColorClass(currentValue, improvedValue) {
  let result = '';
  if (improvedValue > currentValue) {
    result = 'border-green';
  } else if (improvedValue === currentValue) {
    result = 'border-blue';
  }

  return result;
}

//Validiert und konvertiert Kurznotationen (z.B. "9.5b", "1.2m") in numerische Werte.
//Unterstützt Standardzahlen, Kurznotationen und wissenschaftliche Notation.
export function validateAllTimeOrbsInput(input) {
  try {
    const cleanedInput = input.trim().toLowerCase(); // Bereinige die Eingabe

    // Mapping von Suffixen zu numerischen Werten
    const suffixMap = {
      k: 1e3,
      m: 1e6,
      b: 1e9,
      t: 1e12,
      qa: 1e15,
      qu: 1e18,
      sx: 1e21,
      sp: 1e24,
      oc: 1e27,
      n: 1e30,
      d: 1e33,
    };

    // Überprüfen auf Suffix und Parsen
    const match = cleanedInput.match(/^([\d.]+)([a-z]+)?$/);
    if (match) {
      const [, numberPart, suffix] = match;
      let parsedValue = parseFloat(numberPart);

      if (suffix && suffixMap[suffix]) {
        parsedValue *= suffixMap[suffix];
      }

      if (!isNaN(parsedValue)) {
        return parsedValue; // Gültiger numerischer Wert
      }
    }

    // Überprüfung auf wissenschaftliche Notation
    if (!isNaN(parseFloat(cleanedInput))) {
      return parseFloat(cleanedInput);
    }

    // Ungültige Eingabe
    throw new Error("Ungültige Eingabe");
  } catch (error) {
    console.warn("Invalid All-Time Orbs input:", error.message);
    return 0; // Standardwert für ungültige Eingaben
  }
}


