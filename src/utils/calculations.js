import { boosts } from "../store/boosts"; // Importiere die Boost-Liste aus dem Store

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
 
//Berechnung des Frag-Multipliers
export function calculateFragMultiplier(boostKey, value, values = {}) {
  const boost = boosts.find(b => b.key === boostKey);

  if (!boost || boost.fragmulti === undefined) return null; // Falls kein Frag-Multiplier existiert, nichts anzeigen

  if (!value) {
    return 1; // Falls Checkbox nicht aktiviert ist, bleibt der Multiplikator 1
  }

  if (boostKey === "r6" && (!value || value === 0)) return 0;

  const attr3Checked = values && Object.prototype.hasOwnProperty.call(values, "attr3") ? values.attr3 : false;

  //Sonderregel für `m0`: Nur berechnen, wenn `attr3` aktiviert ist
  if (boostKey === "m0" && !attr3Checked) {
    return 1; // Wenn `attr3` nicht aktiviert ist, bleibt `m0 = 1`
  }

  if (typeof boost.fragmulti === "function") {
    return boost.fragmulti(value); // Falls `fragmulti` eine Funktion ist, berechne den Wert
  } else {
    return boost.fragmulti; // Falls `fragmulti` eine feste Zahl ist, direkt zurückgeben
  }
}

//Berechnung der Campaign Fragments
export function calculateCampaignFrags(values, firstShort) {
  if (!values || !firstShort) return 0;

  const attr3Checked = Object.prototype.hasOwnProperty.call(values, "attr3") ? values.attr3 : firstShort.attr3;

  const m0 = calculateFragMultiplier("m0", values.m0 ?? firstShort.m0, { ...values, attr3: attr3Checked }) || 1;
  const attr1 = calculateFragMultiplier("attr1", values.attr1 ?? firstShort.attr1, values) || 1;
  const campfragdet = calculateFragMultiplier("campfragdet", values.campfragdet ?? firstShort.campfragdet, values) || 1;
  const pow2 = calculateFragMultiplier("pow2", values.pow2 ?? firstShort.pow2, values) || 1;
  const campaigns = (values.campaigns ?? firstShort.campaigns) || 0;
  let r6 = values.r6 ?? firstShort.r6 ?? 0; // Sicherstellen, dass r6 nicht `undefined` ist
  let r6Add = 2.75 * r6;
  let r6Multi = Math.pow(1.05, r6);

  let totalFrags = 0;

  console.log("==== Campaign Frag Calculation Start ====");
  console.log(`Base Multipliers: m0=${m0}, attr1=${attr1}, campfragdet=${campfragdet}, pow2=${pow2}, r6add=${r6Add}, r6multi=${r6Multi}, campaigns=${campaigns}`);

  for (let i = 0; i <= campaigns-1; i++) {
    let baseFrags = (2.5 + r6Add) * (m0 * attr1 * campfragdet * pow2 * r6Multi);

    let campaignMulti = 1;
    if (i === 35) campaignMulti = 2;
    if (i === 39) campaignMulti = 3;
    if (i === 43) campaignMulti = 13;

    const fragGain = baseFrags * campaignMulti * Math.pow(1.03, i);
    totalFrags += fragGain;
    console.log(`Campaign ${i}: BaseFrags=${baseFrags.toFixed(2)}, Multi=${campaignMulti}, Scaling=1.03^${i} => FragGain=${fragGain.toFixed(2)}`);
  }

  return totalFrags;
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
export function calculateOrbs(values, boosts, overrideCatchUpMultiplier = null) {
  let result = 1;

  // Wenn overrideCatchUpMultiplier angegeben ist, nutze diesen Wert
  const catchUpMultiplier = overrideCatchUpMultiplier !== null 
    ? overrideCatchUpMultiplier 
    : calculateCupMultiplier(values.hoursInTR || 0);

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
  if (trCount === undefined || allTimeOrbs === undefined) {
    return 0;
  }

  // Feste Werte für TR 0 bis TR 11
  const fixedTRValues = [
    1,     // TR 0
    5.6,   // TR 1
    9.4,   // TR 2
    14.6,  // TR 3
    24.9,  // TR 4
    51.2,  // TR 5
    151,   // TR 6
    404,   // TR 7
    734,   // TR 8
    1060,  // TR 9
    1150,  // TR 10
    2600   // TR 11
  ];

  // Falls trCount im festen Wertebereich ist, gib den entsprechenden Wert zurück
  if (trCount >= 0 && trCount <= 11) {
    return fixedTRValues[trCount];
  }

  // Standard-Berechnung für TR > 11
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
