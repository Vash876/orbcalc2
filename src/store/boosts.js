/**************************************************************************************************** 
key: Der Schlüssel des Boosts
label: Der Name des Boosts
mlabel: Für mobile Ansicht
type: Der Typ des Boosts (number oder boolean)
expand: wird benutzt um die checkbox zu deaktivieren, wenn der max Wert erreicht ist
tooltip: Der Tooltip-Text für den Boost
permanent: wird benutzt um den Boost in weiteren Shorts nicht kleiner zu machen, als er im Fenster oben drüber ist
multiplier: Der Multiplikator für den Boost
fragmulti: Der Multiplikator für die Campaign Frags
max: Der maximale Wert, um den der Boost erweitert werden kann
*****************************************************************************************************/ 

export const boosts = [
  {
    key: 'hoursInTR',
    label: 'Hours in TR',
    mlabel: 'Hours',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: (value, allValues) => {
      const hoursInTR = value || 0;
      const loopMods = allValues.loopMods || 0;
    
      const hoursExponent = Math.min(2.42, 1.02 + hoursInTR * 0.00256);
      const loopModsExponent = Math.min(2.42, 1.02 + loopMods * 0.00005);
  
      const hoursTerm = Math.pow(hoursInTR, hoursExponent);
      const loopModsTerm = Math.pow(loopMods, loopModsExponent);
  
      return Math.pow(1 + hoursTerm * loopModsTerm, 0.06); 
    },
  },
  
  {
    key: 'loopMods',
    label: 'Loop Mods',
    mlabel: 'LMs',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 1,
  },

  {
    key: 'tr5Special',
    label: 'Diamond Special',
    mlabel: 'Diamond',
    type: 'number',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => 1 + 0.01 * value,
    max: 10
  },

  {
    key: 'm0',
    label: 'Milestone #0',
    mlabel: 'm0',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: 'For Campaign Frags Multiplier Attraction Gem Quality #3 required',
    permanent: 1,
    multiplier: (value) => Math.pow(1.1, value),
    fragmulti: (value) => Math.pow(1.011, value),
  },

  {
    key: 'r6',
    label: 'Relic #6',
    mlabel: 'R6',
    type: 'number',
    orbcalc: 0,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    fragmulti: (value) => {
      const part1 = 2.75 * value;
      const part2 = Math.pow(1.05, value); 
      return part1 * part2; 
    },
    max: 11
  },

  {
    key: 'r9',
    label: 'Relic #9',
    mlabel: 'R9',
    type: 'number',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => Math.pow(1.08, value),
    max: 100
  },

  {
    key: 'inscryption52',
    label: 'Inscryption #52',
    mlabel: 'i#52',
    type: 'number',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => Math.pow(1.03, value),
    max: 8
  },

  {
    key: 'inscryption78',
    label: 'Inscryption #78',
    mlabel: 'i#78',
    type: 'number',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => Math.pow(1.08, value),
    max: 8
  },

  {
    key: 'inscryption101',
    label: 'Inscryption #101',
    mlabel: 'i#101',
    type: 'number',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => Math.pow(1.08, value),
    max: 8
  },

  {
    key: 'campaigns',
    label: 'Campaigns',
    mlabel: 'Camps',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: 'Boon e1750 MP required, else 0',
    multiplier: (value) => Math.pow(1.006, value),
    fragmulti: (value) => Math.pow(1.03, value),
  },

  {
    key: 'shipinstalls',
    label: 'Ship Installs',
    mlabel: 'Installs',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: 'Boon e4600 MP required, else 0',
    multiplier: (value) => Math.pow(1.000015, value),
  },

  {
    key: 'oogadget',
    label: 'Orb Gadget',
    mlabel: 'OOdget',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    permanent: 1,
    multiplier: (value) => {
      const baseMultiplier = Math.pow(1 + 0.0035, value);
      const levelMultiplier = Math.pow(1.04, Math.floor(value / 10));

      return 1 * baseMultiplier * levelMultiplier;
    }
  },

  {
    key: 'campfragdet',
    label: 'Camp Fradget',
    mlabel: 'Starmie',
    type: 'number',
    orbcalc: 0,
    expand: '1',
    tooltip: '0',
    permanent: 1,
    fragmulti: (value) => {
      const baseMultiplier = Math.pow(1 + 0.01, value);
      const levelMultiplier = Math.pow(1.08, Math.floor(value / 10));

      return 1 * baseMultiplier * levelMultiplier;
    }
  },

  {
    key: 'research',
    label: 'Research Points',
    mlabel: 'RP',
    type: 'number',
    orbcalc: 1,
    expand: '1',
    tooltip: 'Type in your RP without e, \n e.g. 1e3000 = 3000 \n It will automatically calculate the multiplier of the 4 Reasearches',
    permanent: 0,
    multiplier: (value) => {
      let overallMultiplier = 1;
    
      // Für jede Research (85, 87, 88, 90)
      for (const research in researchData) {
        let researchMultiplier = 1;
        
        // Iteriere über die Level (aufsteigend sortiert)
        for (const levelData of researchData[research]) {
          if (value >= levelData.price) {
            // Level ist erschwinglich – multiplikatorisch berücksichtigen
            researchMultiplier *= levelData.multiplier;
          } else {
            // Sobald ein Level nicht mehr erschwinglich ist, brechen wir ab
            break;
          }
        }
        
        // Multipliziere das Ergebnis der aktuellen Research mit dem Gesamtwert
        overallMultiplier *= researchMultiplier;
      }
    
      return overallMultiplier;
    },
  },

  {
    key: 'research89',
    label: 'Research #89',
    mlabel: 'Res#89',
    type: 'number',
    orbcalc: 0,
    expand: '0',
    tooltip: '0',
    permanent: 1,
    fragmulti: (value) => {
      // Array mit Multiplikatoren für Level 1 bis 6
      const multipliers = [1.1, 1.1, 1.14, 1.14, 1.18, 1.18];
      
      // Starte mit 1 als neutralem Multiplikator
      let result = 1;
      
      // Multipliziere alle Multiplikatoren der Levels, die erreicht wurden.
      // Dabei gehen wir von Index 0 bis levelCount - 1
      for (let i = 0; i < value && i < multipliers.length; i++) {
        result *= multipliers[i];
      }
      
      return result;
    },
    max: 6
  },

  {
    key: 'iap',
    label: 'IAP Trav. Pack',
    mlabel: 'IAP',
    type: 'boolean',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    multiplier: 1.25,
  },

  {
    key: 'hera',
    label: 'Hera Card',
    mlabel: 'Card#1',
    type: 'boolean',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    multiplier: 1.05,
  },

  {
    key: 'jaxis',
    label: 'Jaxis Card',
    mlabel: 'Card#2',
    type: 'boolean',
    orbcalc: 1,
    expand: '0',
    tooltip: '0',
    multiplier: 1.05,
  },

  {
    key: 'db2',
    label: 'Void Badge #1',
    mlabel: 'VB#1',
    type: 'boolean',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 1.25,
  },

  {
    key: 'db4',
    label: 'Void Badge #2',
    mlabel: 'VB#2',
    type: 'boolean',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 1.25,
  },

  {
    key: 'db6',
    label: 'Void Badge #3',
    mlabel: 'VB#3',
    type: 'boolean',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 1.25,
  },

  {
    key: 'db8',
    label: 'Void Badge #4',
    mlabel: 'VB#4',
    type: 'boolean',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 1.5,
  },

  {
    key: 'db10',
    label: 'Void Badge #5',
    mlabel: 'VB#5',
    type: 'boolean',
    orbcalc: 1,
    expand: '1',
    tooltip: '0',
    multiplier: 2,
  },

  {
    key: 'attr3',
    label: 'Attraction Gem #3',
    mlabel: 'AttrGem#3',
    type: 'boolean',
    orbcalc: 0,
    expand: '0',
    permanent: 1,
    tooltip: '0',
    fragmulti: 1,
  },

  {
    key: 'attr1',
    label: 'Attraction GN #1',
    mlabel: 'AttrGN#1',
    type: 'boolean',
    orbcalc: 0,
    expand: '0',
    tooltip: '0',
    fragmulti: 1.5,
  },

  {
    key: 'pow2',
    label: 'Power GN #2',
    mlabel: 'PowGN#2',
    type: 'boolean',
    orbcalc: 0,
    expand: '0',
    tooltip: '0',
    fragmulti: 2,
  },
];

const researchData = {
  '85': [
    { level: 1, price: 2840, multiplier: 1.01 },
    { level: 2, price: 2985, multiplier: 1.02 },
    { level: 3, price: 3130, multiplier: 1.03 },
    { level: 4, price: 3275, multiplier: 1.04 },
    { level: 5, price: 3420, multiplier: 1.05 },
    { level: 6, price: 3565, multiplier: 1.06 }
  ],
  '87': [
    { level: 1, price: 3320, multiplier: 1.01 },
    { level: 2, price: 3440, multiplier: 1.02 },
    { level: 3, price: 3560, multiplier: 1.03 },
    { level: 4, price: 3680, multiplier: 1.04 },
    { level: 5, price: 3800, multiplier: 1.05 },
    { level: 6, price: 3920, multiplier: 1.06 }
  ],
  '88': [
    { level: 1, price: 3355, multiplier: 1.01 },
    { level: 2, price: 3530, multiplier: 1.02 },
    { level: 3, price: 3705, multiplier: 1.03 },
    { level: 4, price: 3880, multiplier: 1.04 },
    { level: 5, price: 4055, multiplier: 1.05 },
    { level: 6, price: 4230, multiplier: 1.06 }
  ],
  '90': [
    { level: 1, price: 3490, multiplier: 1.02 },
    { level: 2, price: 3685, multiplier: 1.03 },
    { level: 3, price: 3880, multiplier: 1.05 },
    { level: 4, price: 4075, multiplier: 1.08 },
    { level: 5, price: 4270, multiplier: 1.13 },
    { level: 6, price: 4465, multiplier: 1.21 }
  ]
};