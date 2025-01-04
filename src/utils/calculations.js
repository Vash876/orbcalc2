//Berechnung des Wertes eines Boosts
export function calculateMultiplier(boost, value, allValues = {}) {
  if (!value) {
    return 1; // Wenn die Checkbox nicht aktiviert ist, wird der Multiplikator ignoriert
  }

  if (typeof boost.multiplier === "function") {
    return boost.multiplier(value, allValues); // Berechnung mit der Funktion
  } else if (typeof boost.multiplier === "number") {
    return boost.multiplier; // Direkter Multiplikator-Wert
  }

  return 1; // Standardwert, falls kein Multiplikator definiert ist
}
 
//Berechnet die zusätzlichen Stunden seit dem ausgewählten Datum
export function calculateAdditionalHours(currentDate, selectedDate) {
  // Konvertiere die Eingaben in Date-Objekte
  const now = new Date(currentDate);
  const selected = new Date(selectedDate);

  // Berechne den Unterschied in Stunden
  const diffInMillis = selected - now;

  // Wenn das Datum in der Vergangenheit liegt, setze den Wert auf 0
  if (diffInMillis <= 0) {
    return 0;
  }

  const diffInHours = diffInMillis / (1000 * 60 * 60); // Millisekunden zu Stunden
  return Math.round(diffInHours); // Ergebnis auf nächste ganze Zahl runden
}

//Funktion zur Berechnung des CatchUp Multipliers
export function calculateCupMultiplier(hoursInTR) {
  if (!hoursInTR) return 1; // Standardwert
  return Math.min(2, Math.max(1, (hoursInTR * 0.00024) / 0.25 + 1));
}

//Berechnet die Orbs basierend auf den Werten und Boosts
export function calculateOrbs(values, boosts) {
  let result = 1;

  // Berechne den Catch-Up-Multiplier separat
  const catchUpMultiplier = calculateCupMultiplier(values.hoursInTR || 0);

  // Iteriere durch alle Boosts und berechne den Multiplikator
  boosts.forEach((boost) => {
    const value = values[boost.key];
    const multiplier = calculateMultiplier(boost, value, values);
    result *= multiplier; // Nutze calculateMultiplier direkt
  });

  // Multipliziere mit dem Catch-Up-Multiplier
  result *= catchUpMultiplier;

  return result;
}

//Berechnet die Requirement für den TR
export function calculateOrbRequirement(trCount, allTimeOrbs) {
  if (!trCount || !allTimeOrbs) {
    return 0;
  }

  return (
    (5 * Math.pow(1.2 + trCount * 0.008, trCount) +
      5000 +
      allTimeOrbs * 0.13) *
    Math.pow(1.02, trCount - 11)
  );
}

//Berechnet die zusätzlichen Stunden für fehlende Orbs
export function calculateMissingHours(
  currentHours,
  trRequirement,
  calculateOrbsFunction,
  boosts,
  index,
  maxIterations = 1000
) {
  let additionalHours = 0;
  let generatedOrbs = calculateOrbsFunction(currentHours + additionalHours, boosts, index);

  // Phase 1: 10-Stunden-Schritte
  while (generatedOrbs < trRequirement && additionalHours < maxIterations) {
    additionalHours += 10;
    generatedOrbs = calculateOrbsFunction(currentHours + additionalHours, boosts, index);
  }

  // Phase 2: 1-Stunden-Schritte
  while (generatedOrbs >= trRequirement && additionalHours > 0) {
    additionalHours -= 1;
    generatedOrbs = calculateOrbsFunction(currentHours + additionalHours, boosts, index);
  }

  // Korrektur auf den kleinsten Wert, der das Requirement erfüllt
  if (generatedOrbs < trRequirement) {
    additionalHours += 1;
  }

  return additionalHours;
}
