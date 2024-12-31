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
 
//Funktion zur Berechnung des CatchUp Multipliers
export function calculateCupMultiplier(hoursInTR) {
  if (!hoursInTR) return 1; // Standardwert
  return Math.min(2, Math.max(1, (hoursInTR * 0.00024) / 0.25 + 1));
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
