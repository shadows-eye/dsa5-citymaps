const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { registerBasicHelpers } from "./lib/helpers.mjs";
import { CityMapsAPI } from "./api.mjs";

registerBasicHelpers();

export class CityMapApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "city-map",
    window: { 
      title: "City Maps"
    },
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

  // --- Singleton & Toggle Logic ---
  static #instance;

  static get isRendered() {
    return this.#instance?.rendered || false;
  }

  static async toggle(forceState = null) {
    if (!this.#instance) this.#instance = new this();
    const shouldOpen = forceState !== null ? forceState : !this.isRendered;

    if (shouldOpen) return this.#instance.render({ force: true });
    else return this.#instance.close();
  }

  // --- Actions ---
  static actions = {
    allOn: () => setAll(false),
    allOff: () => setAll(true),
    toggleDaytime: () => toggleDaytime(),
    selectCity: function (event) {
      const cityId = event.currentTarget.dataset.cityId;
      console.log(`Selected city: ${cityId}`);
      this._revealAreas(cityId);
    },
  };

  async _prepareContext(options) {
    // Retrieve data from our new API
    const registeredCities = game.dsa5CityMaps.getAll();

    const cities = registeredCities.map(city => {
      const defaultIcon = `modules/${city.id}/assets/${city.id}.webp`;
      return {
        id: city.id,
        name: city.name,
        icon: city.icon || defaultIcon,
      };
    });

    console.log("Prepared Cities Data:", cities);
    return { cities };
  }

  _onRender(context, options) {
    const html = this.element;
    html.querySelectorAll(".city-item").forEach(city => {
      city.addEventListener("click", async (event) => {
        const cityId = event.currentTarget.dataset.cityId;
        await this._revealAreas(cityId);
      });
    });
  }

  async _revealAreas(cityId) {
    const cityModule = game.dsa5CityMaps.get(cityId);
    if (!cityModule) {
      ui.notifications.warn(`City '${cityId}' is not registered.`);
      return;
    }
  
    const areas = cityModule.areas || [];
    const areaContainer = this.element.querySelector(".area-buttons");
    areaContainer.innerHTML = "";
  
    const categorizedAreas = areas.reduce((acc, area) => {
      const category = area.category || "Areas";
      if (!acc[category]) acc[category] = [];
      acc[category].push(area);
      return acc;
    }, {});
  
    for (const [category, categoryAreas] of Object.entries(categorizedAreas)) {
      const categoryHeading = document.createElement("h3");
      categoryHeading.textContent = category;
      categoryHeading.className = "area-category";
      areaContainer.appendChild(categoryHeading);
  
      categoryAreas.forEach(area => {
        const row = document.createElement("div");
        row.className = "area-controls";
        row.dataset.tag = area.tag;
  
        row.innerHTML = `
          <div class="area-name">${area.name}</div>
          <button class="dsa5-citymap-button" data-action="on">On</button>
          <button class="dsa5-citymap-button" data-action="50">50%</button>
          <button class="dsa5-citymap-button" data-action="off">Off</button>
        `;
  
        row.querySelector("[data-action='on']").addEventListener("click", () => setByTag(row.dataset.tag, false));
        row.querySelector("[data-action='50']").addEventListener("click", () => setByChance(row.dataset.tag, 0.5));
        row.querySelector("[data-action='off']").addEventListener("click", () => setByTag(row.dataset.tag, true));
  
        areaContainer.appendChild(row);
      });
    }
  
    const areaSection = this.element.querySelector(".area-sections");
    if(areaSection) areaSection.classList.remove("hidden");
  }

  // --- Hook into Close to Unpress Button ---
  async close(options) {
    const result = await super.close(options);
    
    // FIX: Robustly find the tool button even in V13 (Object vs Array)
    let controlList = ui.controls.controls;
    
    // 1. Normalize controls list to Array
    if (!Array.isArray(controlList)) {
       controlList = Object.values(controlList);
    }
    
    // 2. Find token layer ("token" or "tokens")
    const tokenControl = controlList.find(c => c.name === "token" || c.name === "tokens");
      
    if (tokenControl) {
      // 3. Find our specific tool (Array vs Object)
      let tool = null;
      if (Array.isArray(tokenControl.tools)) {
        tool = tokenControl.tools.find(t => t.name === "City-Maps");
      } else {
        tool = tokenControl.tools["City-Maps"]; // V13 Dictionary access
      }

      // 4. Deactivate it
      if (tool) {
        tool.active = false;
        ui.controls.render();
      }
    }
    
    return result;
  }
}

// --- HOOKS ---

Hooks.once("init", async () => {
  game.dsa5CityMaps = new CityMapsAPI();
  await loadTemplates(["modules/dsa5-citymaps/templates/window.hbs"]);
  console.log("City Maps | Templates loaded & API initialized");
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user.isGM) return;

  // --- Normalize 'controls' to Array ---
  let controlList = null;
  if (Array.isArray(controls)) {
    controlList = controls; 
  } else if (typeof controls === "object" && controls !== null) {
    controlList = Object.values(controls); 
  }

  // Fallback to global
  if (!controlList && ui.controls?.controls) {
    controlList = Array.isArray(ui.controls.controls) 
      ? ui.controls.controls 
      : Object.values(ui.controls.controls);
  }

  if (!controlList) return;

  // --- Find Token Layer ---
  const tokenControl = controlList.find(c => c.name === "token" || c.name === "tokens");
  if (!tokenControl) return;

  // --- Define Tool ---
  const toolConfig = {
    name: "City-Maps",
    title: game.i18n.localize("tooltipViewMap"),
    icon: "fas fa-map",
    toggle: true,
    active: CityMapApplication.isRendered,
    // FIX: Use onChange instead of onClick for V13
    onChange: (toggled) => {
      // Ensure we pass a boolean or undefined, not an Event object
      const state = typeof toggled === "boolean" ? toggled : undefined;
      CityMapApplication.toggle(state);
    }
  };

  // --- Add Tool (Handle Array vs Object) ---
  if (Array.isArray(tokenControl.tools)) {
    if (tokenControl.tools.some(tool => tool.name === "City-Maps")) return;
    tokenControl.tools.push(toolConfig);
  } 
  else if (typeof tokenControl.tools === "object" && tokenControl.tools !== null) {
    if (tokenControl.tools["City-Maps"]) return;
    tokenControl.tools["City-Maps"] = toolConfig;
  } 
});

// --- CORE FUNCTIONS ---

function setByTag(tag, isOn) {
  if (typeof Tagger === "undefined") {
    console.warn("City Maps | Tagger module is required for this feature.");
    return;
  }
  const items = Tagger.getByTag(tag);
  if (items.length > 0) {
    const updates = items.map(i => ({ _id: i.id, hidden: isOn }));
    canvas.scene.updateEmbeddedDocuments("AmbientLight", updates);
  }
}

function setByChance(tag, prob) {
  if (typeof Tagger === "undefined") return;
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
  const isDay = canvas.scene.darkness < 0.5;
  canvas.scene.update({ darkness: isDay ? 1 : 0 }, { animateDarkness: true });
}