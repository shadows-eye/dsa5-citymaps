# DSA5 City Maps Module - Developer Guide

This guide explains how developers can create and integrate their own city map modules with the **DSA5 City Maps** core module.

---

## Prerequisites

1. **Module Structure**:
   - Your module must follow the Foundry VTT module structure and include the following:
     - An `assets` folder containing a `.webp` image of your city map, named as `<moduleId>.webp`.
     - A `scripts` folder containing a `cityinfo.mjs` file.

2. **Example Folder Structure**:
dsa5-citymap-grangor/ ├── assets/ │ └── dsa5-citymap-grangor.webp ├── scripts/ │ └── cityinfo.mjs ├── module.json └── lang/ └── [optional localization files]


---

## Registering a City Map

To register your city map with the **DSA5 City Maps** module:

1. Create a `cityinfo.mjs` file in your module’s `scripts` folder.
2. Add the following example script to register your city:
