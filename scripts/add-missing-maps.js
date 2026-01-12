// Add missing maps: Salzwiesen, Askiy Ridge, Scotland
const fs = require('fs');

// Update constants.js
const constantsPath = './build-config/constants.js';
let content = fs.readFileSync(constantsPath, 'utf-8');

// Add missing maps to MAPS array (before the closing ])
const newMaps = `
      // Additional DLC Maps
      { id: 'salzwiesen', name: 'Salzwiesen Park', icon: '🦆', animals: ['greylag_goose', 'tundra_bean_goose', 'ring_necked_pheasant', 'black_grouse', 'european_rabbit', 'raccoon', 'raccoon_dog', 'red_fox', 'goldeneye', 'eurasian_teal', 'mallard'] },
      { id: 'askiy', name: 'Askiy Ridge', icon: '🦬', animals: ['black_bear', 'bighorn_sheep', 'gray_wolf', 'manitoban_elk', 'moose', 'mule_deer', 'pronghorn', 'whitetail', 'wood_bison', 'woodland_caribou', 'mountain_goat', 'beaver'] },
      { id: 'scotland', name: 'Tòrr nan Sithean', icon: '🏴', animals: ['red_deer', 'roe_deer', 'fallow_deer', 'sika_deer', 'wild_boar', 'red_fox', 'feral_goat', 'mountain_hare', 'european_badger', 'black_grouse', 'ring_necked_pheasant'] }`;

content = content.replace(
    /{ id: 'sundarpatan'.*?\].*?animals:.*?\[.*?\] }\s*\]/,
    match => match.slice(0, -1) + ',' + newMaps + '\n    ]'
);

fs.writeFileSync(constantsPath, content, 'utf-8');
console.log('Added Salzwiesen, Askiy Ridge, Scotland to constants.js');

// Update animal-data.json
const dataPath = './build-config/animal-data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Add new animals
const newAnimals = {
    greylag_goose: { name_de: 'Graugans', name_en: 'Greylag Goose', icon: '🦆', class: 1, silver: 2.80, gold: 3.40, diamond: 3.85 },
    tundra_bean_goose: { name_de: 'Tundrasaatgans', name_en: 'Tundra Bean Goose', icon: '🦆', class: 1, silver: 2.18, gold: 2.74, diamond: 3.16 },
    goldeneye: { name_de: 'Schellente', name_en: 'Common Goldeneye', icon: '🦆', class: 1, silver: 740, gold: 1020, diamond: 1230 },
    eurasian_teal: { name_de: 'Eurasische Krickente', name_en: 'Eurasian Teal', icon: '🦆', class: 1, silver: 312, gold: 336, diamond: 354 },
    beaver: { name_de: 'Biber', name_en: 'North American Beaver', icon: '🦫', class: 2, silver: 10, gold: 15, diamond: 20 },
    manitoban_elk: { name_de: 'Manitoba-Wapiti', name_en: 'Manitoban Elk', icon: '🦌', class: 8, silver: 177.83, gold: 351.32, diamond: 481.41 },
    wood_bison: { name_de: 'Waldbison', name_en: 'Wood Bison', icon: '🦬', class: 9, silver: 50.70, gold: 148.10, diamond: 221.15 },
    woodland_caribou: { name_de: 'Waldkaribu', name_en: 'Woodland Caribou', icon: '🦌', class: 6, silver: 152.53, gold: 311.21, diamond: 420.23 },
    european_badger: { name_de: 'Europäischer Dachs', name_en: 'European Badger', icon: '🦡', class: 2, silver: 8, gold: 12, diamond: 16 }
};

Object.entries(newAnimals).forEach(([id, animal]) => {
    if (!data.animals[id]) {
        data.animals[id] = { ...animal, need_zones: {} };
        console.log('Added animal:', id);
    }
});

// Add need zones for new maps
const salzwiesenZones = {
    red_fox: { drink: [[17, 20]], feed: [[0, 4], [4, 7], [20, 24]], rest: [[7, 10], [10, 13], [13, 17]] },
    raccoon_dog: { drink: [[10, 13]], feed: [[3, 6], [20, 24]], rest: [[6, 10], [13, 16], [16, 20]] },
    ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
    black_grouse: { feed: [[4, 8], [8, 11], [14, 18]], drink: [], rest: [[0, 4], [11, 14], [18, 21], [21, 24]] }
};

const askiyZones = {
    moose: { drink: [[12, 16]], feed: [[4, 8], [16, 20], [20, 24]], rest: [[0, 4], [8, 12]] },
    gray_wolf: { drink: [[0, 3]], feed: [[3, 6]], rest: [[6, 10], [10, 14]] },
    mule_deer: { drink: [[15, 18]], feed: [[0, 3], [3, 6], [21, 24]], rest: [[6, 9], [9, 12], [12, 15], [18, 21]] },
    black_bear: { drink: [[4, 8]], feed: [[0, 4], [20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
    bighorn_sheep: { drink: [[12, 16]], feed: [[3, 6], [6, 9], [9, 12], [16, 20]], rest: [[0, 3], [20, 24]] },
    wood_bison: { drink: [[8, 12]], feed: [[4, 8], [16, 20]], rest: [[0, 4], [12, 16], [20, 24]] },
    manitoban_elk: { drink: [[4, 8]], feed: [[8, 12], [16, 20]], rest: [[0, 4], [12, 16], [20, 24]] },
    woodland_caribou: { drink: [[20, 24]], feed: [[8, 12], [16, 20]], rest: [[0, 4], [12, 16]] },
    mountain_goat: { feed: [[4, 7], [7, 10], [10, 13], [17, 20]], drink: [], rest: [[0, 4], [13, 17], [20, 24]] }
};

const scotlandZones = {
    red_deer: { drink: [[6, 10]], feed: [[13, 17], [17, 21]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
    roe_deer: { drink: [[14, 17]], feed: [[8, 11]], rest: [[0, 3], [3, 6]] },
    fallow_deer: { drink: [[6, 10]], feed: [[14, 18]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] },
    sika_deer: { drink: [[10, 13]], feed: [[6, 10]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] },
    wild_boar: { drink: [[0, 3]], feed: [[6, 9]], rest: [[9, 12]] },
    red_fox: { feed: [[1, 4], [11, 14], [19, 22]], drink: [[17, 20]], rest: [[4, 7], [7, 10], [14, 19]] },
    feral_goat: { drink: [[12, 15]], feed: [[6, 9]], rest: [[3, 6], [21, 24]] },
    mountain_hare: { feed: [[4, 7], [7, 10], [10, 13]], drink: [], rest: [[21, 24], [0, 4], [13, 17]] },
    european_badger: { feed: [[6, 10]], drink: [], rest: [[10, 14], [14, 18]] },
    black_grouse: { feed: [[4, 8], [8, 11]], drink: [], rest: [[11, 14], [0, 4]] },
    ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] }
};

const toZones = (ranges) => ranges.map(([s, e]) => ({ start: s, end: e }));

// Apply zones
[['salzwiesen', salzwiesenZones], ['askiy', askiyZones], ['scotland', scotlandZones]].forEach(([mapId, zones]) => {
    Object.entries(zones).forEach(([animalId, z]) => {
        if (data.animals[animalId]) {
            if (!data.animals[animalId].need_zones) data.animals[animalId].need_zones = {};
            data.animals[animalId].need_zones[mapId] = {
                drink: toZones(z.drink || []),
                feed: toZones(z.feed || []),
                rest: toZones(z.rest || [])
            };
        }
    });
});

// Update _maps
data._maps.push(
    { id: 'salzwiesen', animals: ['greylag_goose', 'tundra_bean_goose', 'ring_necked_pheasant', 'black_grouse', 'european_rabbit', 'raccoon', 'raccoon_dog', 'red_fox', 'goldeneye', 'eurasian_teal', 'mallard'] },
    { id: 'askiy', animals: ['black_bear', 'bighorn_sheep', 'gray_wolf', 'manitoban_elk', 'moose', 'mule_deer', 'pronghorn', 'whitetail', 'wood_bison', 'woodland_caribou', 'mountain_goat', 'beaver'] },
    { id: 'scotland', animals: ['red_deer', 'roe_deer', 'fallow_deer', 'sika_deer', 'wild_boar', 'red_fox', 'feral_goat', 'mountain_hare', 'european_badger', 'black_grouse', 'ring_necked_pheasant'] }
);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Added maps and need zones to animal-data.json');
