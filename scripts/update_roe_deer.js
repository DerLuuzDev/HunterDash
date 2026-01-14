const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../build-config/animal-data.json');
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

function updateAnimal(id, stats) {
    if (!data.animals[id]) return;
    const animal = data.animals[id];

    // Update Stats
    if (stats.max_score) animal.max_score = stats.max_score;
    if (stats.diamond) animal.diamond = stats.diamond;
    if (stats.gold) animal.gold = stats.gold;
    if (stats.silver) animal.silver = stats.silver;
    if (stats.max_weight_kg) animal.max_weight_kg = stats.max_weight_kg;
    if (stats.lures) animal.lures = stats.lures;

    // Update Furs - Merge Arrays to keep unique values or replace? Replacement is safer for "Source of Truth"
    if (stats.fur_common) animal.fur_common = stats.fur_common;
    if (stats.fur_rare) animal.fur_rare = stats.fur_rare;

    // Update Hirschfelden Zones
    if (stats.zones) {
        if (!animal.need_zones) animal.need_zones = {};
        // Specific update for hirschfelden as implied by current workflow
        animal.need_zones['hirschfelden'] = stats.zones;
    }
}

// Roe Deer Update from Screenshot
updateAnimal('roe_deer', {
    max_score: 95.00,
    diamond: 81.86,
    gold: 64.37,
    silver: 41.04,
    max_weight_kg: 35,
    lures: ["Rehwild-Lockpfeife (Caller)", "Rehduft (Duft)"],
    fur_common: ["braun", "dunkelbraun", "dunkelgrau", "hellbraun", "orange"],
    fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
    zones: {
        drink: [{ start: 14, end: 17 }],
        feed: [
            { start: 4, end: 10 },
            { start: 17, end: 20 }
        ],
        rest: [
            { start: 0, end: 4 },
            { start: 10, end: 14 },
            { start: 20, end: 24 }
        ]
    }
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('✅ Updated Roe Deer data from screenshot');
