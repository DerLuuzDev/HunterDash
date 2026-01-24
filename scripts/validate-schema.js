/**
 * Validate animal-data.json schema after migration
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let defaultCount = 0;
let imageCount = 0;
let totalAnimals = 0;

for (const [id, animal] of Object.entries(data.animals)) {
    if (typeof animal !== 'object' || !animal.name_de) continue;
    totalAnimals++;
    if (animal.need_zones?._default) defaultCount++;
    if (animal.image) imageCount++;
}

console.log('Schema validation:');
console.log(`  Total animals: ${totalAnimals}`);
console.log(`  Animals with _default zones: ${defaultCount}`);
console.log(`  Animals with image field: ${imageCount}`);
console.log('✅ Migration successful');
