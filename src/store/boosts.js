/**************************************************************************************************** 
key: Der Schlüssel des Boosts
label: Der Name des Boosts
type: Der Typ des Boosts (number oder boolean)
expand: wird benutzt um die checkbox zu deaktivieren, wenn der max Wert erreicht ist
tooltip: Der Tooltip-Text für den Boost
permanent: wird benutzt um den Boost in weiteren Shorts nicht kleiner zu machen, als er im Fenster oben drüber ist
multiplier: Der Multiplikator für den Boost
max: Der maximale Wert, um den der Boost erweitert werden kann
*****************************************************************************************************/ 

export const boosts = [
    {
      key: 'hoursInTR',
      label: 'Hours in TR',
      type: 'number',
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
      type: 'number',
      expand: '1',
      tooltip: '0',
      multiplier: 1,
    },
  
    {
      key: 'tr5Special',
      label: 'Diamond Special',
      type: 'number',
      expand: '0',
      tooltip: 'max Value: 10',
      permanent: 1,
      multiplier: (value) => 1 + 0.01 * value,
      max: 10
    },
  
    {
      key: 'm0',
      label: 'm0',
      type: 'number',
      expand: '1',
      tooltip: '0',
      permanent: 1,
      multiplier: (value) => Math.pow(1.1, value),
    },
  
    {
      key: 'r9',
      label: 'R9',
      type: 'number',
      expand: '0',
      tooltip: '0',
      permanent: 1,
      multiplier: (value) => Math.pow(1.08, value),
      max: 100
    },
  
    {
      key: 'inscryption52',
      label: 'Inscryption #52',
      type: 'number',
      expand: '0',
      tooltip: 'max Value: 8',
      permanent: 1,
      multiplier: (value) => Math.pow(1.03, value),
      max: 8
    },
  
    {
      key: 'inscryption78',
      label: 'Inscryption #78',
      type: 'number',
      expand: '0',
      tooltip: 'max Value: 8',
      permanent: 1,
      multiplier: (value) => Math.pow(1.08, value),
      max: 8
    },
  
    {
      key: 'campaigns',
      label: 'Campaigns',
      type: 'number',
      expand: '1',
      tooltip: 'Boon of Ouroboros required, else 0',
      multiplier: (value) => Math.pow(1.006, value),
    },
  
    {
      key: 'gadget',
      label: 'Gadget',
      type: 'number',
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
      key: 'iap',
      label: 'IAP Trav. Pack',
      type: 'boolean',
      expand: '0',
      tooltip: '0',
      multiplier: 1.25,
    },
  
    {
      key: 'hera',
      label: 'Hera Card',
      type: 'boolean',
      expand: '0',
      tooltip: '0',
      multiplier: 1.05,
    },
  
    {
      key: 'jaxis',
      label: 'Jaxis Card',
      type: 'boolean',
      expand: '0',
      tooltip: '0',
      multiplier: 1.05,
    },
  
    {
      key: 'db2',
      label: 'Void Badge #1',
      type: 'boolean',
      expand: '1',
      tooltip: '0',
      multiplier: 1.25,
    },
  
    {
      key: 'db4',
      label: 'Void Badge #2',
      type: 'boolean',
      expand: '1',
      tooltip: '0',
      multiplier: 1.25,
    },
  
    {
      key: 'db6',
      label: 'Void Badge #3',
      type: 'boolean',
      expand: '1',
      tooltip: '0',
      multiplier: 1.25,
    },
  
    {
      key: 'db8',
      label: 'Void Badge #4',
      type: 'boolean',
      expand: '1',
      tooltip: '0',
      multiplier: 1.5,
    },
  
    {
      key: 'db10',
      label: 'Void Badge #5',
      type: 'boolean',
      expand: '1',
      tooltip: '0',
      multiplier: 2,
    },
  ];
  