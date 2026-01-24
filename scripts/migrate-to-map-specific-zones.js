/**
 * Migration Script: Convert flat need_zones to map-specific structure
 * 
 * This script transforms the animal-data.json from:
 *   "need_zones": { "drink": [...], "feed": [...], "rest": [...] }
 * 
 * To:
 *   "need_zones": { "_default": { "drink": [...], "feed": [...], "rest": [...] } }
 * 
 * And also replaces "icon" emoji field with "image" filename field.
 */

const fs = require('fs');
const path = require('path');

// Load current animal data
const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('Starting migration...');
console.log(`Found ${Object.keys(data.animals).length} animals to migrate.\n`);

let migratedCount = 0;
let imageCount = 0;

for (const [animalId, animal] of Object.entries(data.animals)) {
    // Skip non-animal nested objects (malformed data like cape_buffalo nested inside eurasian_wigeon)
    if (typeof animal !== 'object' || !animal.name_de) {
        console.log(`⚠️  Skipping malformed entry: ${animalId}`);
        continue;
    }

    // Migrate need_zones to _default structure
    if (animal.need_zones && !animal.need_zones._default) {
        // Check if it's the old flat structure
        if (animal.need_zones.drink !== undefined ||
            animal.need_zones.feed !== undefined ||
            animal.need_zones.rest !== undefined) {

            const oldZones = {
                drink: animal.need_zones.drink || [],
                feed: animal.need_zones.feed || [],
                rest: animal.need_zones.rest || []
            };

            animal.need_zones = {
                _default: oldZones
            };

            migratedCount++;
            console.log(`✅ Migrated need_zones for: ${animalId}`);
        }
    }

    // Replace emoji icon with image filename
    if (animal.icon && !animal.image) {
        animal.image = `${animalId}.png`;
        delete animal.icon;
        imageCount++;
    }
}

// Update the format documentation
data._format = {
    animals: "Tier-ID → Stats + need_zones pro Map",
    need_zones: "{ _default: {drink, feed, rest}, [mapId]: {drink, feed, rest} }",
    stats: "class, difficulty, max_level, max_score, diamond, gold, silver, fur_common, fur_rare, lures, image"
};

// Write updated data
const outputPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✅ Migration complete!`);
console.log(`   - Migrated ${migratedCount} need_zones structures`);
console.log(`   - Converted ${imageCount} emoji icons to image filenames`);
console.log(`   - Output saved to: ${outputPath}`);
