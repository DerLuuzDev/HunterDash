// Update map animal lists and add missing animals based on tiltaaa data
const fs = require('fs');

// Update constants.js MAPS array
const constantsPath = './build-config/constants.js';
let constantsContent = fs.readFileSync(constantsPath, 'utf-8');

// Complete animal lists per map from tiltaaa data
const mapAnimals = {
    hirschfelden: ['red_deer', 'roe_deer', 'fallow_deer', 'wild_boar', 'european_rabbit', 'red_fox', 'ring_necked_pheasant', 'canada_goose', 'european_bison'],
    layton: ['whitetail', 'blacktail', 'moose', 'roosevelt_elk', 'black_bear', 'coyote', 'jackrabbit', 'mallard', 'turkey'],
    medved: ['brown_bear', 'moose', 'reindeer', 'wild_boar', 'musk_deer', 'eurasian_lynx', 'western_capercaillie', 'gray_wolf'],
    vurhonga: ['lion', 'cape_buffalo', 'gemsbok', 'springbok', 'blue_wildebeest', 'lesser_kudu', 'scrub_hare', 'warthog', 'side_striped_jackal'],
    parque: ['red_deer', 'water_buffalo', 'axis_deer', 'cinnamon_teal', 'blackbuck', 'puma', 'collared_peccary', 'mule_deer'],
    yukon: ['grizzly_bear', 'moose', 'plains_bison', 'caribou', 'gray_wolf', 'red_fox', 'canada_goose'],
    cuatro: ['iberian_wolf', 'iberian_mouflon', 'red_deer', 'roe_deer', 'wild_boar', 'beceite_ibex', 'ronda_ibex', 'european_hare', 'ring_necked_pheasant'],
    silver_ridge: ['rocky_mountain_elk', 'mule_deer', 'mountain_lion', 'mountain_goat', 'bighorn_sheep', 'pronghorn', 'black_bear', 'plains_bison', 'turkey'],
    te_awaroa: ['red_deer', 'feral_goat', 'feral_pig', 'sika_deer', 'fallow_deer', 'chamois', 'turkey'],
    rancho: ['whitetail', 'mule_deer', 'rio_grande_turkey', 'ring_necked_pheasant', 'antelope_jackrabbit', 'collared_peccary', 'bighorn_sheep', 'coyote', 'mexican_bobcat', 'pronghorn'],
    mississippi: ['whitetail', 'eastern_wild_turkey', 'bobwhite_quail', 'eastern_cottontail', 'gray_fox', 'raccoon', 'wild_hog', 'american_alligator', 'black_bear'],
    revontuli: ['whitetail', 'moose', 'brown_bear', 'eurasian_lynx', 'rock_ptarmigan', 'willow_ptarmigan', 'black_grouse', 'hazel_grouse', 'western_capercaillie', 'raccoon_dog', 'mountain_hare'],
    new_england: ['whitetail', 'black_bear', 'moose', 'bobcat', 'eastern_wild_turkey', 'eastern_cottontail', 'gray_fox', 'red_fox', 'coyote', 'ring_necked_pheasant', 'bobwhite_quail', 'raccoon'],
    emerald: ['red_deer', 'sambar_deer', 'javan_rusa', 'axis_deer', 'fallow_deer', 'banteng', 'feral_pig', 'feral_goat', 'hog_deer', 'red_fox', 'saltwater_crocodile', 'stubble_quail'],
    sundarpatan: ['bengal_tiger', 'water_buffalo', 'himalayan_tahr', 'nilgai', 'blackbuck', 'indian_muntjac', 'blue_sheep', 'barasingha', 'snow_leopard', 'tibetan_fox', 'woolly_hare', 'wild_yak']
};

// Update animal-data.json with complete animal definitions
const dataPath = './build-config/animal-data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Add missing animals
const missingAnimals = {
    ring_necked_pheasant: { name_de: 'Ringfasan', name_en: 'Ring-necked Pheasant', icon: '🐦', class: 1, silver: 9.10, gold: 15.50, diamond: 20.30 },
    european_hare: { name_de: 'Feldhase', name_en: 'European Hare', icon: '🐰', class: 1, silver: 3, gold: 5, diamond: 6.50 },
    willow_ptarmigan: { name_de: 'Moorschneehuhn', name_en: 'Willow Ptarmigan', icon: '🐦', class: 1, silver: 506, gold: 658, diamond: 772 },
    stubble_quail: { name_de: 'Schwarzbrustwachtel', name_en: 'Stubble Quail', icon: '🐦', class: 1, silver: 154, gold: 202, diamond: 238 },
    woolly_hare: { name_de: 'Tibetanischer Wollhase', name_en: 'Woolly Hare', icon: '🐰', class: 1, silver: 1.74, gold: 2.62, diamond: 3.28 },
    barasingha: { name_de: 'Barasingha', name_en: 'Barasingha', icon: '🦌', class: 6, silver: 95.88, gold: 170.26, diamond: 226.05 },
    snow_leopard: { name_de: 'Schneeleopard', name_en: 'Snow Leopard', icon: '🐆', class: 4, silver: 22, gold: 26, diamond: 29 },
    tibetan_fox: { name_de: 'Tibetfuchs', name_en: 'Tibetan Fox', icon: '🦊', class: 2, silver: 3.36, gold: 5.08, diamond: 6.36 },
    wild_yak: { name_de: 'Wildyak', name_en: 'Wild Yak', icon: '🦬', class: 9, silver: 174.60, gold: 230.96, diamond: 273.23 },
    saltwater_crocodile: { name_de: 'Salzwasserkrokodil', name_en: 'Saltwater Crocodile', icon: '🐊', class: 7, silver: 420, gold: 760, diamond: 1015 },
    collared_peccary: { name_de: 'Halsbandpekari', name_en: 'Collared Peccary', icon: '🐗', class: 4, silver: 37.50, gold: 98.50, diamond: 144.25 }
};

Object.entries(missingAnimals).forEach(([id, animal]) => {
    if (!data.animals[id]) {
        data.animals[id] = {
            name_de: animal.name_de,
            name_en: animal.name_en,
            icon: animal.icon,
            class: animal.class,
            silver: animal.silver,
            gold: animal.gold,
            diamond: animal.diamond,
            need_zones: {}
        };
        console.log('Added missing animal:', id);
    }
});

// Update _maps in animal-data.json
data._maps = Object.entries(mapAnimals).map(([id, animals]) => ({
    id,
    animals
}));

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated animal-data.json with complete map lists');

// Count animals per map
Object.entries(mapAnimals).forEach(([map, animals]) => {
    console.log(`${map}: ${animals.length} animals`);
});
