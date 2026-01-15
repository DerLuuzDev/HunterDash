/**
 * Script to fix animal-data.json structure:
 * Move all animals from root level into the 'animals' object
 */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');

// Read the file
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Identify meta keys (not animals)
const metaKeys = ['_comment', '_format', '_maps', 'animals'];

// Collect animals at root level
const animalsAtRoot = [];
Object.entries(data).forEach(([key, val]) => {
    if (!metaKeys.includes(key) && typeof val === 'object' && val !== null && val.name_de) {
        animalsAtRoot.push(key);
    }
});

console.log(`Gefunden: ${animalsAtRoot.length} Tiere auf Root-Ebene`);

if (animalsAtRoot.length === 0) {
    console.log('✅ Keine Tiere auf Root-Ebene gefunden. Struktur ist bereits korrekt.');
    process.exit(0);
}

// Initialize animals object if it doesn't exist
if (!data.animals) {
    data.animals = {};
}

// Move animals from root to animals object
animalsAtRoot.forEach(animalId => {
    data.animals[animalId] = data[animalId];
    delete data[animalId];
});

console.log(`\nVerschobene Tiere: ${animalsAtRoot.slice(0, 10).join(', ')}${animalsAtRoot.length > 10 ? '...' : ''}`);

// Rebuild the object with correct order: meta keys first, then animals
const newData = {
    _comment: data._comment,
    _format: data._format,
    _maps: data._maps,
    animals: data.animals
};

// Write the result
fs.writeFileSync(inputPath, JSON.stringify(newData, null, 2), 'utf8');

console.log(`\n✅ animal-data.json wurde aktualisiert:`);
console.log(`   - ${animalsAtRoot.length} Tiere von Root-Ebene nach 'animals' verschoben`);
console.log(`   - Gesamt: ${Object.keys(data.animals).length} Tiere unter 'animals'`);
