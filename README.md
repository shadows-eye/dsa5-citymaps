![](https://img.shields.io/badge/Foundry-v12-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
<!--- ![Latest Release Download Count](https://img.shields.io/github/downloads/<user>/<repo>/latest/module.zip) -->

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->


# DSA5 City Maps Module

The **DSA5 City Maps** module provides a button within Foundry VTT's scene controls to access city-specific maps and manage lighting configurations. This tool is particularly useful for managing areas within a city, toggling lights, and dynamically interacting with specific city areas and special places.

---

## Features

- **City Map Button**: Adds a new button to the scene controls to access registered city maps.
- **Dynamic City Area Controls**: Displays area-specific controls for toggling lights and adjusting lighting probabilities.
- **Integration with Other Modules**: Supports dynamic registration of external city map modules.

---

## How to Use

1. **Access the City Map Button**:
   - Open the scene controls and find the **City Maps** button (icon: 🗺️).
   - Clicking the button opens the City Map application.

2. **City Map Application**:
   - Displays all registered city maps.
   - Clicking on a city reveals its areas and associated controls.

3. **Area Controls**:
   - Adjust lighting for specific areas:
     - **On**: Turn all lights on.
     - **50%**: Set a 50% chance for lights to turn on/off.
     - **Off**: Turn all lights off.

---

## Requirements

- Foundry VTT version 12 or later.
- The **Tagger** module (needed for the functions).
