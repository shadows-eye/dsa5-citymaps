const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { registerBasicHelpers } from "./lib/helpers.mjs"; // Import helper functions

registerBasicHelpers(); // Register Handlebars helpers

export class CityMapApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "city-map",
    window: { title: "City Menue" },
    tag: "div",
    position: { width: 640, height: 640, left: 130, top: 180 },
    resizable: true,
    classes: ["city-map-window"],
  };

  static PARTS = {
    content: {
      template: "modules/dsa5-citymaps/templates/window.hbs",
    },
  };

  static actions = {
    allOn: () => setAll(false),
    allOff: () => setAll(true),
    toggleDaytime: () => toggleDaytime(),
    selectCity: function (event) {
      const cityId = event.currentTarget.dataset.cityId;
      console.log(`Selected city: ${cityId}`);
      this._loadCityAreas(cityId);
    },
  };

  /**
   * Prepare data for the application template
   */
  async _prepareContext(options) {
    // Fetch registered city modules
    const registeredCityModules = game.user.getFlag("dsa5-citymaps", "cityModules") || [];
    
    // Map registered city modules to displayable cities
    const cities = registeredCityModules.map(module => ({
      id: module.id || "unknown",
      name: module.name || "Unnamed City",
      icon: `modules/${module.id}/assets/${module.id}.webp`,
    }));

    return { cities }; // Provide cities for the template
  }

  /**
   * Post-render actions, such as adding event listeners
   */
  _onRender(context, options) {
    const html = this.element;

    // Add click listener to city items
    html.querySelectorAll(".city-item").forEach(city => {
      city.addEventListener("click", async (event) => {
        const cityId = event.currentTarget.dataset.cityId;
        console.log(`Clicked city: ${cityId}`);
        await this._revealAreas(cityId);
      });
    });
  }

  /**
   * Load and display areas for a specific city
   * @param {string} cityId
   */
  async _revealAreas(cityId) {
    // Get registered city modules
    const registeredCityModules = game.user.getFlag("dsa5-citymaps", "cityModules") || [];
    console.log("Registered City Modules:", registeredCityModules);
  
    // Find the selected city module by ID
    const cityModule = registeredCityModules.find(city => city.id === cityId);
    console.log("Selected City Module:", cityModule);
  
    if (!cityModule) {
      console.warn(`City module '${cityId}' not found.`);
      ui.notifications.warn(`City '${cityId}' is not registered.`);
      return;
    }
  
    // Retrieve areas from the city module
    const areas = cityModule.areas || [];
    console.log("Areas for City:", areas);
  
    const areaContainer = this.element.querySelector(".area-buttons");
  
    // Clear previous content
    areaContainer.innerHTML = "";
  
    // Group areas by category
    const categorizedAreas = areas.reduce((acc, area) => {
      const category = area.category || "Areas"; // Default to "Areas" if no category
      if (!acc[category]) acc[category] = [];
      acc[category].push(area);
      return acc;
    }, {});
  
    console.log("Categorized Areas:", categorizedAreas);
  
    // Populate with grouped areas
    for (const [category, categoryAreas] of Object.entries(categorizedAreas)) {
      console.log(`Category: ${category}, Areas:`, categoryAreas);
  
      // Create a category heading
      const categoryHeading = document.createElement("h3");
      categoryHeading.textContent = category;
      categoryHeading.className = "area-category";
      areaContainer.appendChild(categoryHeading);
  
      // Add areas within the category
      categoryAreas.forEach(area => {
        const row = document.createElement("div");
        row.className = "area-controls";
        row.dataset.tag = area.tag;
  
        // Append name and buttons directly into the grid
        row.innerHTML = `
          <div class="area-name">${area.name}</div>
          <button class="dsa5-citymap-button" data-action="on">On</button>
          <button class="dsa5-citymap-button" data-action="50">50%</button>
          <button class="dsa5-citymap-button" data-action="off">Off</button>
        `;
  
        // Attach event listeners for buttons
        row.querySelector("[data-action='on']").addEventListener("click", () => setByTag(row.dataset.tag, false));
        row.querySelector("[data-action='50']").addEventListener("click", () => setByChance(row.dataset.tag, 0.5));
        row.querySelector("[data-action='off']").addEventListener("click", () => setByTag(row.dataset.tag, true));
  
        areaContainer.appendChild(row);
      });
    }
  
    // Reveal the area section
    const areaSection = this.element.querySelector(".area-sections");
    areaSection.classList.remove("hidden");
  }

}

// Hooks
Hooks.once("init", async () => {
  await loadTemplates(["modules/dsa5-citymaps/templates/window.hbs"]); // Adjusted for new module path
  console.log("Templates loaded!");
});

Hooks.on("getSceneControlButtons", (controls) => {
  console.log("Checking for existing City Map buttons...");
  
  // Find the token control
  const tokenControl = controls.find(c => c.name === 'token');
  if (tokenControl) {
    // Check if a City Map button already exists
    const existingButton = tokenControl.tools.some(tool => tool.name === "City-Maps");
    if (existingButton) {
      console.log("City Map button already exists. Skipping addition.");
      return; // Exit if the button is already present
    }

    // Add the City Map button
    tokenControl.tools.push({
      name: "City-Maps",
      title: game.i18n.localize("tooltipViewMap"),
      icon: "fas fa-map",
      onClick: () => {
        const cityMapApp = new CityMapApplication();
        cityMapApp.render(true);
        console.log("City Map Application opened.");
      },
      button: true,
    });

    console.log("City Map button added successfully.");
  } else {
    console.warn("Could not find 'token' controls to add City Map button.");
  }
});

Hooks.once("ready", async () => {
  if (game.user.isGM) {
    console.log("Registering city module for GM...");
    try {
      const moduleId = "dsa5-citymap-grangor"; // Example module ID
      const moduleName = "Grangor"; // Example module name
      await addCityModule(moduleId, moduleName);
    } catch (err) {
      console.error("Error registering city module:", err);
    }
  }
});

// Add City Module
async function addCityModule(moduleId, moduleName) {
  try {
    if (!game.user.isGM) return;

    let cityModules = game.user.getFlag("dsa5-citymaps", "cityModules") || [];
    if (cityModules.some(city => city.id === moduleId)) {
      console.log(`City module '${moduleName}' is already registered.`);
      return;
    }

    cityModules.push({ id: moduleId, name: moduleName });
    await game.user.setFlag("dsa5-citymaps", "cityModules", cityModules);

    console.log(`City module '${moduleName}' has been added.`);
  } catch (err) {
    console.error("Error adding city module:", err);
  }
}

// Core Functions
function setByTag(tag, isOn) {
  const items = Tagger.getByTag(tag);
  if (items.length > 0) {
    const updates = items.map(i => ({ _id: i.id, hidden: isOn }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}

function setByChance(tag, prob) {
  const items = Tagger.getByTag(tag);
  if (items.length > 0) {
    const updates = items.map(i => ({
      _id: i.id,
      hidden: Math.random() < prob,
    }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}

function setAll(isOn) {
  canvas.lighting.updateAll({ hidden: isOn });
}

function toggleDaytime() {
  const isDay = canvas.scene.data.darkness < 0.5;
  canvas.scene.update({ darkness: isDay ? 1 : 0 }, { animateDarkness: true });
}