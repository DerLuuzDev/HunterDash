const { REFERENCE } = require('../build-config/constants');
const fs = require('fs');
const path = require('path');

class ReferenceService {
    constructor() {
        this.maps = REFERENCE.MAPS;
        this.needZones = REFERENCE.NEED_ZONES;
        this.animalNames = REFERENCE.ANIMAL_NAMES;

        // Load consolidated animal data from JSON file
        this.animalData = this.loadAnimalData();
    }

    /**
     * Load consolidated animal data from JSON file (developer-editable)
     * Contains stats, fur colors, lures, and need zones per map
     */
    loadAnimalData() {
        try {
            const jsonPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
            if (fs.existsSync(jsonPath)) {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                console.log('ReferenceService: Consolidated animal data loaded from JSON file');
                return data;
            }
        } catch (error) {
            console.error('ReferenceService: Error loading animal data:', error);
        }
        return null;
    }

    /**
     * Get stats for a specific animal
     * @param {string} animalId - Animal identifier
     */
    getAnimalStats(animalId) {
        if (!this.animalData?.animals) return null;
        const animal = this.animalData.animals[animalId];
        if (!animal) return null;

        // Return stats without need_zones (for backward compatibility)
        const { need_zones, ...stats } = animal;
        return stats;
    }

    /**
     * Get all available maps
     */
    getMaps() {
        return {
            success: true,
            data: this.maps
        };
    }

    /**
     * Get animals for a specific map
     * @param {string} mapId - Map identifier
     */
    getAnimalsForMap(mapId) {
        const map = this.maps.find(m => m.id === mapId);
        if (!map) {
            return { success: false, error: 'Map not found' };
        }

        // Use animal order from animal-data.json if available, otherwise fallback to constants.js
        const mapDataFromJson = this.animalData?._maps?.find(m => m.id === mapId);
        const animalOrder = mapDataFromJson?.animals || map.animals;

        const animals = animalOrder.map(animalId => {
            const animalData = this.animalNames[animalId] || { en: animalId, de: animalId, icon: '🦌' };

            // Check if we have consolidated JSON data for this animal
            const jsonAnimal = this.animalData?.animals?.[animalId];

            let zones = null;
            let icon = animalData.icon || '🦌';
            let name = animalData;
            let stats = null;

            if (jsonAnimal) {
                // Get need zones - now they are flat (not per-map)
                const animalZones = jsonAnimal.need_zones;
                if (animalZones && (animalZones.drink || animalZones.feed || animalZones.rest)) {
                    zones = {
                        drink: animalZones.drink || [],
                        feed: animalZones.feed || [],
                        rest: animalZones.rest || []
                    };
                }
                icon = jsonAnimal.icon || icon;
                // Merge name from JSON if available
                name = {
                    ...animalData,
                    de: jsonAnimal.name_de || animalData.de,
                    en: jsonAnimal.name_en || animalData.en
                };
                // Include stats for modal display
                const { need_zones, ...animalStats } = jsonAnimal;
                stats = animalStats;
            } else {
                // Fallback to constants.js data
                zones = this.needZones[animalId] || null;
            }

            return {
                id: animalId,
                name: name,
                icon: icon,
                zones: zones,
                stats: stats
            };
        });

        return {
            success: true,
            data: {
                map: map,
                animals: animals
            }
        };
    }

    /**
     * Get need zones for a specific animal
     * @param {string} animalId - Animal identifier
     */
    getZonesForAnimal(animalId) {
        const zones = this.needZones[animalId];
        if (!zones) {
            return { success: false, error: 'Animal not found' };
        }

        return {
            success: true,
            data: {
                id: animalId,
                name: this.animalNames[animalId] || { en: animalId, de: animalId },
                zones: zones
            }
        };
    }

    /**
     * Get all animals currently in a specific need zone at a given time
     * @param {number} time - Time in 24h format (e.g., 8.5 for 8:30)
     * @param {string} zoneType - 'drink', 'feed', or 'rest'
     * @param {string} mapId - Optional map filter
     */
    getActiveAnimals(time, zoneType = 'drink', mapId = null) {
        let animalIds = Object.keys(this.needZones);

        // Filter by map if specified
        if (mapId) {
            const map = this.maps.find(m => m.id === mapId);
            if (map) {
                animalIds = animalIds.filter(id => map.animals.includes(id));
            }
        }

        const activeAnimals = animalIds.filter(animalId => {
            const zones = this.needZones[animalId];
            if (!zones || !zones[zoneType]) return false;

            return zones[zoneType].some(period => this.isTimeInPeriod(time, period.start, period.end));
        });

        return {
            success: true,
            data: activeAnimals.map(id => ({
                id: id,
                name: this.animalNames[id] || { en: id, de: id },
                zones: this.needZones[id]
            }))
        };
    }

    /**
     * Check if a time falls within a period (handles overnight periods)
     * @param {number} time - Current time
     * @param {number} start - Period start
     * @param {number} end - Period end
     */
    isTimeInPeriod(time, start, end) {
        if (start <= end) {
            // Normal period (e.g., 6-10)
            return time >= start && time < end;
        } else {
            // Overnight period (e.g., 21-5)
            return time >= start || time < end;
        }
    }

    /**
     * Get the next drink time for an animal
     * @param {string} animalId - Animal identifier
     * @param {number} currentTime - Current in-game time
     */
    getNextDrinkTime(animalId, currentTime) {
        const zones = this.needZones[animalId];
        if (!zones || !zones.drink) {
            return { success: false, error: 'Animal not found or no drink zones' };
        }

        // Find next drink period
        let nextDrink = null;
        let minWait = 25; // More than 24h means not found

        for (const period of zones.drink) {
            let wait;
            if (currentTime < period.start) {
                wait = period.start - currentTime;
            } else if (currentTime >= period.end || period.start > period.end) {
                // We're past this period or it's an overnight period
                if (period.start > period.end && currentTime >= period.start) {
                    wait = 0; // Currently in overnight period
                } else {
                    wait = (24 - currentTime) + period.start;
                }
            } else {
                wait = 0; // Currently in period
            }

            if (wait < minWait) {
                minWait = wait;
                nextDrink = period;
            }
        }

        return {
            success: true,
            data: {
                nextPeriod: nextDrink,
                waitHours: minWait,
                isCurrentlyActive: minWait === 0
            }
        };
    }

    /**
     * Search animals by name
     * @param {string} query - Search query
     * @param {string} language - 'en' or 'de'
     */
    searchAnimals(query, language = 'de') {
        const queryLower = query.toLowerCase();
        const results = [];

        for (const [animalId, names] of Object.entries(this.animalNames)) {
            const name = names[language] || names.en;
            if (name.toLowerCase().includes(queryLower)) {
                results.push({
                    id: animalId,
                    name: names,
                    zones: this.needZones[animalId]
                });
            }
        }

        return {
            success: true,
            data: results
        };
    }
}

const referenceService = new ReferenceService();
module.exports = referenceService;
