/**
 * Script to simplify animal-data.json:
 * 1. Flatten need_zones structure (remove map subdivision, use single set of zones)
 * 2. Sort animals by max_weight_kg (descending)
 */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const outputPath = inputPath;

// Read the file
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Helper: Check if key is a metadata/config key (not an animal)
const isMetaKey = (key) => {
    return key.startsWith('_') || ['history', 'purge', 'reserve', 'here', 'ammunition', 'integrity', 'harvest_screen', 'local_sitemap'].includes(key);
};

// Collect all entries
const metaEntries = [];
const animalEntries = [];

for (const [key, value] of Object.entries(data)) {
    if (isMetaKey(key)) {
        metaEntries.push([key, value]);
    } else if (typeof value === 'object' && value !== null && value.name_de) {
        // This is an animal entry
        animalEntries.push([key, value]);
    } else {
        // Other entries (e.g., arrays like _maps)
        metaEntries.push([key, value]);
    }
}

console.log(`Gefunden: ${animalEntries.length} Tiere, ${metaEntries.length} Meta-Einträge`);

// Transform each animal's need_zones
for (const [key, animal] of animalEntries) {
    if (animal.need_zones && typeof animal.need_zones === 'object') {
        const zoneKeys = Object.keys(animal.need_zones);

        // Check if the first key is a map name (not drink/feed/rest)
        if (zoneKeys.length > 0 && !['drink', 'feed', 'rest'].includes(zoneKeys[0])) {
            // This is map-structured data - take the first map's data
            const firstMapData = animal.need_zones[zoneKeys[0]];

            if (firstMapData && typeof firstMapData === 'object') {
                // Replace the nested structure with a flat structure
                animal.need_zones = {
                    drink: firstMapData.drink || [],
                    feed: firstMapData.feed || [],
                    rest: firstMapData.rest || []
                };
            }
        }
    }
}

// Sort animals by max_weight_kg (descending - heaviest first)
animalEntries.sort((a, b) => {
    const weightA = a[1].max_weight_kg || 0;
    const weightB = b[1].max_weight_kg || 0;
    return weightB - weightA;
});

console.log('Top 5 schwerste Tiere:');
for (let i = 0; i < 5 && i < animalEntries.length; i++) {
    console.log(`  ${i + 1}. ${animalEntries[i][1].name_de || animalEntries[i][0]}: ${animalEntries[i][1].max_weight_kg || 0} kg`);
}

// Rebuild the data object: meta entries first, then sorted animals
const newData = {};

for (const [key, value] of metaEntries) {
    newData[key] = value;
}

for (const [key, animal] of animalEntries) {
    newData[key] = animal;
}

// Write the result
fs.writeFileSync(outputPath, JSON.stringify(newData, null, 2), 'utf8');

console.log('\n✅ animal-data.json wurde aktualisiert:');
console.log('   - need_zones Struktur vereinfacht (keine Map-Unterteilung mehr)');
console.log('   - Tiere nach max_weight_kg sortiert (schwerste zuerst)');
