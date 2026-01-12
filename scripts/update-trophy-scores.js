// Update trophy scores from espis.de data
const fs = require('fs');
const dataPath = './build-config/animal-data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const trophyData = {
    // Hirschfelden
    canada_goose: { silver: 4.40, gold: 6.80, diamond: 8.59, class: 1 },
    ring_necked_pheasant: { silver: 9.10, gold: 15.50, diamond: 20.30, class: 1 },
    european_rabbit: { silver: 1.24, gold: 1.92, diamond: 2.42, class: 1 },
    red_fox: { silver: 4.70, gold: 10.0, diamond: 14.10, class: 2 },
    roe_deer: { silver: 41.00, gold: 64.30, diamond: 81.80, class: 3 },
    fallow_deer: { silver: 67.98, gold: 172.98, diamond: 251.72, class: 4 },
    wild_boar: { silver: 37.50, gold: 98.50, diamond: 144.25, class: 4 },
    red_deer: { silver: 90.50, gold: 182.25, diamond: 251.07, class: 6 },
    european_bison: { silver: 63.20, gold: 181.60, diamond: 270.40, class: 9 },

    // Layton
    mallard: { silver: 9.96, gold: 15.48, diamond: 19.61, class: 1 },
    turkey: { silver: 3.36, gold: 4.08, diamond: 4.62, class: 1 },
    jackrabbit: { silver: 2.88, gold: 4.85, diamond: 6.33, class: 1 },
    coyote: { silver: 38.36, gold: 48.94, diamond: 56.87, class: 2 },
    blacktail: { silver: 76.92, gold: 134.44, diamond: 177.58, class: 4 },
    whitetail: { silver: 112.05, gold: 193.39, diamond: 255.09, class: 4 },
    black_bear: { silver: 14.40, gold: 19.20, diamond: 22.80, class: 7 },
    roosevelt_elk: { silver: 128.70, gold: 272.78, diamond: 380.84, class: 8 },
    moose: { silver: 86.22, gold: 194.09, diamond: 274.99, class: 8 },

    // Medved
    western_capercaillie: { silver: 2.20, gold: 3.60, diamond: 4.64, class: 1 },
    musk_deer: { silver: 60, gold: 168, diamond: 249, class: 2 },
    eurasian_lynx: { silver: 18.58, gold: 23.78, diamond: 27.68, class: 3 },
    gray_wolf: { silver: 32, gold: 36, diamond: 39, class: 5 },
    reindeer: { silver: 152.53, gold: 311.21, diamond: 430.23, class: 6 },
    brown_bear: { silver: 18.60, gold: 23.80, diamond: 27.70, class: 7 },

    // Vurhonga
    scrub_hare: { silver: 2.36, gold: 4.08, diamond: 5.37, class: 1 },
    side_striped_jackal: { silver: 16.75, gold: 23.80, diamond: 29.10, class: 2 },
    springbok: { silver: 69.40, gold: 93, diamond: 110.70, class: 3 },
    lesser_kudu: { silver: 107.83, gold: 132.86, diamond: 151.64, class: 4 },
    warthog: { silver: 24.60, gold: 43.80, diamond: 58.19, class: 4 },
    blue_wildebeest: { silver: 21.60, gold: 30.80, diamond: 37.69, class: 4 },
    gemsbok: { silver: 194.80, gold: 276.40, diamond: 337.59, class: 6 },
    cape_buffalo: { silver: 73.30, gold: 117.90, diamond: 151.35, class: 8 },
    lion: { silver: 38, gold: 44, diamond: 48.50, class: 9 },

    // Parque
    cinnamon_teal: { silver: 3.36, gold: 4.08, diamond: 4.62, class: 1 },
    axis_deer: { silver: 72.83, gold: 155.38, diamond: 217.29, class: 3 },
    blackbuck: { silver: 71.80, gold: 106.35, diamond: 132.26, class: 3 },
    collared_peccary: { silver: 37.50, gold: 98.50, diamond: 144.25, class: 4 },
    puma: { silver: 32, gold: 36, diamond: 39, class: 5 },
    mule_deer: { silver: 98.36, gold: 220.54, diamond: 312.17, class: 6 },
    water_buffalo: { silver: 84.27, gold: 131.85, diamond: 167.54, class: 9 },

    // Yukon
    harlequin_duck: { silver: 5.34, gold: 6.42, diamond: 7.32, class: 1 },
    caribou: { silver: 152.53, gold: 311.21, diamond: 420.23, class: 6 },
    grizzly_bear: { silver: 52.60, gold: 60.80, diamond: 66.94, class: 7 },
    plains_bison: { silver: 50.70, gold: 148.10, diamond: 221.15, class: 9 },

    // Cuatro
    european_hare: { silver: 3, gold: 5, diamond: 6.50, class: 1 },
    iberian_mouflon: { silver: 97.01, gold: 144.18, diamond: 179.56, class: 4 },
    ronda_ibex: { silver: 69.29, gold: 91.40, diamond: 107.98, class: 4 },
    beceite_ibex: { silver: 78.01, gold: 142.93, diamond: 191.63, class: 4 },
    iberian_wolf: { silver: 32, gold: 36, diamond: 39, class: 5 },

    // Silver Ridge
    mountain_goat: { silver: 52.72, gold: 84.12, diamond: 107.34, class: 4 },
    bighorn_sheep: { silver: 90.31, gold: 132.78, diamond: 164.63, class: 4 },
    pronghorn: { silver: 46.09, gold: 75.77, diamond: 98.02, class: 4 },
    mountain_lion: { silver: 32, gold: 36, diamond: 39, class: 5 },
    rocky_mountain_elk: { silver: 177.83, gold: 351.32, diamond: 481.41, class: 8 },

    // Te Awaroa
    chamois: { silver: 30.84, gold: 46.36, diamond: 58, class: 3 },
    feral_goat: { silver: 89.44, gold: 157.60, diamond: 208.71, class: 3 },
    sika_deer: { silver: 53.29, gold: 136.40, diamond: 198.74, class: 4 },
    feral_pig: { silver: 37.50, gold: 98.50, diamond: 144.25, class: 4 },

    // Rancho
    rio_grande_turkey: { silver: 3.30, gold: 4, diamond: 4.60, class: 1 },
    antelope_jackrabbit: { silver: 2.80, gold: 4.80, diamond: 6.30, class: 1 },
    mexican_bobcat: { silver: 18.58, gold: 23.78, diamond: 27.68, class: 3 },

    // Mississippi
    bobwhite_quail: { silver: 159, gold: 217, diamond: 260.50, class: 1 },
    eastern_wild_turkey: { silver: 2.50, gold: 3.70, diamond: 4.60, class: 1 },
    eastern_cottontail: { silver: 1.05, gold: 1.58, diamond: 1.97, class: 1 },
    gray_fox: { silver: 3.84, gold: 5.32, diamond: 6.43, class: 2 },
    raccoon: { silver: 5, gold: 9, diamond: 12, class: 2 },
    wild_hog: { silver: 37.50, gold: 98.50, diamond: 144.20, class: 4 },
    american_alligator: { silver: 226, gold: 378, diamond: 492, class: 6 },

    // Revontuli
    rock_ptarmigan: { silver: 492, gold: 616, diamond: 709, class: 1 },
    black_grouse: { silver: 85, gold: 105, diamond: 120, class: 1 },
    hazel_grouse: { silver: 33, gold: 390, diamond: 435, class: 1 },
    mountain_hare: { silver: 2.8, gold: 4.4, diamond: 5.6, class: 1 },
    raccoon_dog: { silver: 4.40, gold: 7.20, diamond: 9.29, class: 2 },

    // New England
    bobcat: { silver: 18.58, gold: 23.78, diamond: 27.68, class: 3 },

    // Emerald
    sambar_deer: { silver: 67.92, gold: 124.21, diamond: 166.43, class: 6 },
    javan_rusa: { silver: 64.62, gold: 112.71, diamond: 148.78, class: 4 },
    hog_deer: { silver: 49.45, gold: 83.30, diamond: 108.68, class: 3 },
    banteng: { silver: 71.77, gold: 109.04, diamond: 137, class: 9 },
    saltwater_crocodile: { silver: 420, gold: 760, diamond: 1015, class: 7 },

    // Sundarpatan
    bengal_tiger: { silver: 36, gold: 48, diamond: 57, class: 9 },
    himalayan_tahr: { silver: 61.23, gold: 84.46, diamond: 101.87, class: 4 },
    blue_sheep: { silver: 67.37, gold: 116.92, diamond: 154.08, class: 4 },
    nilgai: { silver: 69.17, gold: 83.87, diamond: 94.89, class: 6 },
    indian_muntjac: { silver: 25.25, gold: 30.96, diamond: 35.24, class: 2 },
    barasingha: { silver: 95.88, gold: 170.26, diamond: 226.05, class: 6 },
    snow_leopard: { silver: 22, gold: 26, diamond: 29, class: 4 },
    tibetan_fox: { silver: 3.36, gold: 5.08, diamond: 6.36, class: 2 },
    woolly_hare: { silver: 1.74, gold: 2.62, diamond: 3.28, class: 1 },
    wild_yak: { silver: 174.60, gold: 230.96, diamond: 273.23, class: 9 }
};

// Update each animal
Object.entries(trophyData).forEach(([id, stats]) => {
    if (data.animals[id]) {
        data.animals[id].silver = stats.silver;
        data.animals[id].gold = stats.gold;
        data.animals[id].diamond = stats.diamond;
        data.animals[id].class = stats.class;
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated trophy scores for', Object.keys(trophyData).length, 'animals');
