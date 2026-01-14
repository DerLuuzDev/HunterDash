const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../build-config/animal-data.json');
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

function updateAnimal(id, stats) {
    if (!data.animals[id]) return;
    const animal = data.animals[id];

    // Update Trophies if provided
    if (stats.diamond) animal.diamond = stats.diamond;
    if (stats.gold) animal.gold = stats.gold;
    if (stats.silver) animal.silver = stats.silver;

    // Update Max Weight and Difficulty
    if (stats.max_weight) animal.max_weight_kg = stats.max_weight;
    if (stats.difficulty) animal.class = stats.difficulty; // Assuming "Difficulty" column means Class or Max Level?
    // Wait, screenshot says "Animal (Class)" and "Difficulty". 
    // Example: "Europe Bison (9)" -> Class 9. Difficulty 5.
    // So "Difficulty" column = max_level (difficulty rating)
    if (stats.difficulty) animal.max_level = stats.difficulty;

    // Update Great One if clear evidence (Red Deer has GO row)
    if (stats.great_one) animal.great_one = true;

    // Update Hirschfelden Zones
    if (stats.zones) {
        if (!animal.need_zones) animal.need_zones = {};
        animal.need_zones['hirschfelden'] = stats.zones;
    }
}

// 1. European Bison
updateAnimal('european_bison', {
    diamond: 127.62, gold: 110.01, silver: 86.53,
    max_weight: 920, difficulty: 5,
    zones: {
        feed: [{ start: 0, end: 3.5 }, { start: 19, end: 23.5 }],
        drink: [{ start: 3, end: 7.5 }],
        rest: [{ start: 7, end: 11.5 }, { start: 11, end: 15.5 }, { start: 15, end: 19.5 }]
    }
});

// 2. Red Deer
updateAnimal('red_deer', {
    diamond: 251, gold: 182.2, silver: 90.5,
    max_weight: 240, difficulty: 9,
    great_one: true,
    zones: {
        feed: [{ start: 13, end: 17.5 }],
        drink: [{ start: 5, end: 9.5 }, { start: 17, end: 21.5 }],
        rest: [{ start: 1, end: 5.5 }, { start: 9, end: 13.5 }, { start: 21.5, end: 1.5 }]
    }
});

// 3. Wild Boar
updateAnimal('wild_boar', {
    diamond: 144.25, gold: 98.5, silver: 37.5,
    max_weight: 240, difficulty: 5,
    zones: {
        feed: [{ start: 3, end: 7.5 }, { start: 19, end: 23.5 }],
        drink: [{ start: 23, end: 3.5 }],
        rest: [{ start: 7, end: 11.5 }, { start: 11, end: 15.5 }, { start: 15, end: 19.5 }]
    }
});

// 4. Fallow Deer
updateAnimal('fallow_deer', {
    diamond: 249.99, gold: 187.81, silver: 104.89,
    max_weight: 100, difficulty: 5,
    great_one: true, // Known to exist
    zones: {
        feed: [{ start: 5, end: 9.5 }, { start: 17, end: 21.5 }],
        drink: [{ start: 9, end: 13.5 }],
        rest: [{ start: 0, end: 5.5 }, { start: 13, end: 17.5 }, { start: 21.5, end: 0.5 }]
    }
});

// 5. Roe Deer
updateAnimal('roe_deer', {
    diamond: 81.8, gold: 64.3, silver: 41,
    max_weight: 35, difficulty: 3,
    zones: {
        feed: [{ start: 5, end: 9.5 }, { start: 17, end: 21.5 }],
        drink: [{ start: 13, end: 17.5 }],
        rest: [{ start: 0, end: 5.5 }, { start: 9, end: 11.5 }, { start: 21, end: 0.5 }]
    }
});

// 6. Red Fox
updateAnimal('red_fox', {
    diamond: 14, gold: 10, silver: 4.6,
    max_weight: 15, difficulty: 9,
    zones: {
        feed: [{ start: 0, end: 3.5 }, { start: 3, end: 7.5 }],
        drink: [{ start: 19, end: 0.5 }],
        rest: [{ start: 7, end: 11.5 }, { start: 11, end: 15.5 }, { start: 15, end: 19.5 }]
    }
});

// 7. European Rabbit
updateAnimal('european_rabbit', {
    diamond: 2.4, gold: 1.9, silver: 1.2,
    max_weight: 5, difficulty: 3,
    zones: {
        feed: [{ start: 5, end: 9 }, { start: 12, end: 16 }, { start: 18, end: 22 }],
        drink: [],
        rest: []
    }
});

// 8. Canada Goose
updateAnimal('canada_goose', {
    diamond: 8.5, gold: 6.8, silver: 4.4,
    max_weight: 9, difficulty: 5
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('✅ Updated Hirschfelden data from Screenshot 2');
