/**
 * Fix animals missing _default need zones
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Default zones for animals with missing data
const fixZones = {
    european_hare: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
    },
    willow_ptarmigan: {
        drink: [],
        feed: [{ start: 5, end: 10 }, { start: 15, end: 19 }],
        rest: [{ start: 10, end: 15 }, { start: 19, end: 5 }]
    },
    stubble_quail: {
        drink: [],
        feed: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        rest: [{ start: 10, end: 16 }, { start: 20, end: 6 }]
    },
    woolly_hare: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
    },
    barasingha: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
    },
    snow_leopard: {
        drink: [{ start: 4, end: 8 }],
        feed: [{ start: 0, end: 4 }, { start: 20, end: 24 }],
        rest: [{ start: 8, end: 20 }]
    },
    tibetan_fox: {
        drink: [{ start: 17, end: 20 }],
        feed: [{ start: 0, end: 7 }, { start: 20, end: 24 }],
        rest: [{ start: 7, end: 17 }]
    },
    wild_yak: {
        drink: [{ start: 8, end: 12 }],
        feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }],
        rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }]
    },
    saltwater_crocodile: {
        drink: [],
        feed: [{ start: 10, end: 18 }],
        rest: [{ start: 18, end: 10 }]
    },
    collared_peccary: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
    },
    greylag_goose: {
        drink: [],
        feed: [{ start: 5, end: 9 }, { start: 13, end: 17 }],
        rest: [{ start: 9, end: 13 }, { start: 17, end: 5 }]
    },
    tundra_bean_goose: {
        drink: [],
        feed: [{ start: 5, end: 9 }, { start: 13, end: 17 }],
        rest: [{ start: 9, end: 13 }, { start: 17, end: 5 }]
    },
    goldeneye: {
        drink: [],
        feed: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        rest: [{ start: 10, end: 16 }, { start: 20, end: 6 }]
    },
    eurasian_teal: {
        drink: [],
        feed: [{ start: 5, end: 9 }, { start: 15, end: 19 }],
        rest: [{ start: 9, end: 15 }, { start: 19, end: 5 }]
    },
    beaver: {
        drink: [],
        feed: [{ start: 18, end: 6 }],
        rest: [{ start: 6, end: 18 }]
    }
};

let fixedCount = 0;

for (const [id, zones] of Object.entries(fixZones)) {
    if (data.animals[id]) {
        if (!data.animals[id].need_zones) {
            data.animals[id].need_zones = {};
        }
        data.animals[id].need_zones._default = zones;
        fixedCount++;
        console.log(`✅ Fixed zones for: ${id}`);
    } else {
        console.log(`⚠️  Animal not found: ${id}`);
    }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\n✅ Fixed ${fixedCount} animals`);
