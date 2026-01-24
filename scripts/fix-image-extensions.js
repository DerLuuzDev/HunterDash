/**
 * Fix: Update image extensions in animal-data.json from .png to .svg
 */

const fs = require('fs');
const path = require('path');

// Load animal data
const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('Fixing image extensions...\n');

let count = 0;
for (const [animalId, animal] of Object.entries(data.animals)) {
    if (typeof animal !== 'object' || !animal.name_de) continue;

    if (animal.image && animal.image.endsWith('.png')) {
        animal.image = animal.image.replace('.png', '.svg');
        count++;
    }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Fixed ${count} image extensions (.png -> .svg)`);
