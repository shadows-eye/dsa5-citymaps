# DSA5 City Maps Module - Developer Guide

This guide explains how developers can create and integrate their own city map modules with the **DSA5 City Maps** core module.

---

## Prerequisites

1. **Module Structure**:
   - Your module must follow the Foundry VTT module structure and include the following:
     - An `assets` folder containing a `.webp` image of your city map, named as `<moduleId>.webp`.
     - A `scripts` folder containing a `cityinfo.mjs` file.

2. **Example Folder Structure**:
```
dsa5-citymap-grangor/ 
├── assets/ 
│ └── dsa5-citymap-grangor.webp 
├── cityinfo.mjs 
├── module.json 
└── lang/ └── [optional localization files]
```

---

## Registering a City Map

To register your city map with the **DSA5 City Maps** module:

1. Create a `cityinfo.mjs` file in your module’s `scripts` folder.
2. Add the following example script to register your city:

---

## Registering a City Map

To register your city map with the **DSA5 City Maps** module:

1. Create a `cityinfo.mjs` file in your module’s `scripts` folder.
2. Add the following example script to register your city:

```javascript
export const GrangorAreas = [
{ name: "Alt-Grangor", tag: "altGrangor", category: "Residential" },
{ name: "Grangorella", tag: "grangorella", category: "Residential" },
{ name: "Kopp", tag: "kopp", category: "Residential" },
{ name: "Koppstein", tag: "koppstein", category: "Residential" },
{ name: "Neuhaven", tag: "neuhaven", category: "Residential" },
{ name: "Sicheln", tag: "sicheln", category: "Residential" },
{ name: "Süd-Grangor", tag: "suedgrangor", category: "Residential" },
{ name: "Suderstadt", tag: "suderstadt", category: "Residential" },
{ name: "Traviastrand", tag: "traviastrand", category: "Residential" },
{ name: "Koppsund", tag: "koppsund", category: "Residential" },
];

export const GrangorSpecialPlaces = [
{ name: "Rahja Tempel", tag: "rahja", category: "Special Places" },
{ name: "Tsa Tempel", tag: "tsa", category: "Special Places" },
{ name: "Drachentempel (Rondra Tempel)", tag: "rondra", category: "Special Places" },
{ name: "Pilgertempel (Efferd)", tag: "efferd", category: "Special Places" },
];

/**
* Register this city module with the dsa5-citymaps module
*/
async function registerCityModule() {
if (!game.user.isGM) return; // Only GMs can register city modules

const moduleId = "dsa5-citymap-grangor"; // This module's ID
const moduleName = "Grangor"; // This module's name

// City-specific data to register
const cityData = {
 id: moduleId,
 name: moduleName,
 icon: `modules/${moduleId}/assets/${moduleId}.webp`,
 areas: [...GrangorAreas, ...GrangorSpecialPlaces],
};

// Register the city module with the core City Maps module
let cityModules = game.user.getFlag("dsa5-citymaps", "cityModules") || [];
if (cityModules.some(city => city.id === moduleId)) {
 console.log(`City module '${moduleName}' is already registered.`);
 return;
}

cityModules.push(cityData);
await game.user.setFlag("dsa5-citymaps", "cityModules", cityModules);
console.log(`City module '${moduleName}' has been registered successfully.`);
}

// Register when Foundry is ready
Hooks.once("ready", async () => {
await registerCityModule();
});
```