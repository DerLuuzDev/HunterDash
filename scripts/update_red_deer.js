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
    if (stats.lures) animal.lures = stats.lures;

    // Update Hirschfelden Zones
    if (stats.zones) {
        if (!animal.need_zones) animal.need_zones = {};
        animal.need_zones['hirschfelden'] = stats.zones;
    }
}

// Red Deer Update from Screenshot 3
updateAnimal('red_deer', {
    max_score: 271.00,
    diamond: 251.07, gold: 182.25, silver: 90.50,
    lures: ["Rothirsch-Lockhorn (Caller)", "Rothirschduft (Duft)"],
    zones: {
        drink: [{ start: 6, end: 10 }],
        feed: [{ start: 13, end: 21 }],
        rest: [
            { start: 0, end: 6 },
            { start: 10, end: 13 },
            { start: 21, end: 24 } // 24 = 0 for logic, handled by format? usually 0.
        ]
    }
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('✅ Updated Red Deer data from new screenshot');
