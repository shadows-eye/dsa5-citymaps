/**
 * Handles the registration and retrieval of city data in memory.
 */
export class CityMapsAPI {
  constructor() {
    this.cities = new Map();
  }

  /**
   * Registers a new city module.
   * @param {Object} data - The city configuration object.
   * @param {string} data.id - Unique ID for the city (e.g., "grangor").
   * @param {string} data.name - Display name (e.g., "Grangor").
   * @param {string} data.icon - Path to the city icon image.
   * @param {Array} data.areas - Array of area objects {name, tag, category}.
   */
  register(data) {
    if (!data.id || !data.name) {
      console.error("City Maps | Registration failed: Missing 'id' or 'name'", data);
      return;
    }

    if (this.cities.has(data.id)) {
      console.warn(`City Maps | Overwriting existing city registration for: ${data.id}`);
    }

    // Store the city data
    this.cities.set(data.id, data);
    console.log(`City Maps | Registered city: ${data.name}`);
  }

  /**
   * Returns all registered cities as an array.
   * @returns {Array}
   */
  getAll() {
    return Array.from(this.cities.values());
  }

  /**
   * Returns a specific city by ID.
   * @param {string} id 
   * @returns {Object|undefined}
   */
  get(id) {
    return this.cities.get(id);
  }
}