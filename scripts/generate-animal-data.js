// Script to generate comprehensive animal-data.json
// Run with: node scripts/generate-animal-data.js

const fs = require('fs');

const data = {
    "_comment": "Konsolidierte Tier-Daten für HunterDash - Daten von espis.de und COTW Wiki",
    "_format": {
        "animals": "Tier-ID → Stats + need_zones pro Map",
        "need_zones": "Map-ID → {drink, feed, rest} Arrays mit {start, end}",
        "stats": "class, difficulty, max_level, max_score, diamond, gold, silver, fur_common, fur_rare, lures"
    },
    "_maps": {
        "hirschfelden": { "name": "Hirschfelden", "icon": "🦌", "animals": ["red_deer", "roe_deer", "fallow_deer", "wild_boar", "european_rabbit", "red_fox", "ring_necked_pheasant", "canada_goose", "european_bison"] },
        "layton": { "name": "Layton Lake District", "icon": "🏔️", "animals": ["whitetail", "blacktail", "roosevelt_elk", "moose", "black_bear", "coyote", "jackrabbit", "mallard", "turkey"] },
        "medved": { "name": "Medved-Taiga", "icon": "🐻", "animals": ["brown_bear", "moose", "reindeer", "wild_boar", "gray_wolf", "eurasian_lynx", "musk_deer", "western_capercaillie"] },
        "vurhonga": { "name": "Vurhonga Savanna", "icon": "🦁", "animals": ["lion", "cape_buffalo", "blue_wildebeest", "gemsbok", "springbok", "lesser_kudu", "warthog", "side_striped_jackal", "scrub_hare"] },
        "parque": { "name": "Parque Fernando", "icon": "🌴", "animals": ["red_deer", "water_buffalo", "axis_deer", "cinnamon_teal", "blackbuck", "puma", "wild_boar", "mule_deer"] },
        "yukon": { "name": "Yukon Valley", "icon": "🐻", "animals": ["grizzly_bear", "moose", "plains_bison", "caribou", "gray_wolf", "red_fox", "harlequin_duck", "canada_goose"] },
        "cuatro": { "name": "Cuatro Colinas", "icon": "🐗", "animals": ["iberian_wolf", "iberian_mouflon", "red_deer", "roe_deer", "wild_boar", "beceite_ibex", "european_rabbit", "ronda_ibex"] },
        "silver_ridge": { "name": "Silver Ridge Peaks", "icon": "🏔️", "animals": ["rocky_mountain_elk", "mule_deer", "mountain_lion", "mountain_goat", "bighorn_sheep", "pronghorn", "black_bear", "plains_bison", "turkey"] },
        "te_awaroa": { "name": "Te Awaroa", "icon": "🥝", "animals": ["red_deer", "feral_goat", "feral_pig", "sika_deer", "fallow_deer", "chamois", "turkey"] },
        "rancho": { "name": "Rancho del Arroyo", "icon": "🌵", "animals": ["whitetail", "mule_deer", "rio_grande_turkey", "ring_necked_pheasant", "antelope_jackrabbit", "collared_peccary", "bighorn_sheep", "coyote", "mexican_bobcat"] },
        "mississippi": { "name": "Mississippi Acres", "icon": "🐊", "animals": ["whitetail", "eastern_wild_turkey", "bobwhite_quail", "eastern_cottontail", "gray_fox", "raccoon", "wild_hog", "american_alligator"] },
        "revontuli": { "name": "Revontuli Coast", "icon": "🌲", "animals": ["whitetail", "moose", "brown_bear", "eurasian_lynx", "gray_wolf", "rock_ptarmigan", "goldeneye", "black_grouse", "hazel_grouse", "raccoon_dog", "mountain_hare"] },
        "new_england": { "name": "New England Mountains", "icon": "🍂", "animals": ["whitetail", "black_bear", "moose", "bobcat", "eastern_wild_turkey", "snowshoe_hare", "gray_fox", "red_fox", "mallard"] },
        "emerald": { "name": "Emerald Coast", "icon": "🦘", "animals": ["sambar_deer", "javan_rusa", "axis_deer", "water_buffalo", "banteng", "wild_boar", "hog_deer", "magpie_goose"] },
        "sundarpatan": { "name": "Sundarpatan Nepal", "icon": "🐅", "animals": ["bengal_tiger", "water_buffalo", "himalayan_tahr", "sambar_deer", "axis_deer", "nilgai", "indian_muntjac", "wild_boar", "blue_sheep"] }
    },
    "animals": {}
};

// Animal definitions with stats from espis.de and COTW Wiki
const animals = {
    // HIRSCHFELDEN
    "red_deer": {
        name_de: "Rothirsch", name_en: "Red Deer", icon: "🦌",
        class: 6, difficulty: "Leicht - Legendär", max_level: 9,
        max_score: 276.90, diamond: 251.07, gold: 182.25, silver: 90.50,
        fur_common: ["braun", "dunkelbraun", "hellbraun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)", "erythristisch (selten)"],
        lures: ["Rothirsch-Lockpfeife (Caller)", "Rothirschduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 5, end: 9 }], feed: [{ start: 17, end: 21 }], rest: [{ start: 9, end: 17 }, { start: 21, end: 5 }] },
            cuatro: { drink: [{ start: 7, end: 11 }], feed: [{ start: 15, end: 19 }], rest: [{ start: 11, end: 15 }, { start: 19, end: 7 }] },
            te_awaroa: { drink: [{ start: 4, end: 8 }], feed: [{ start: 16, end: 20 }], rest: [{ start: 8, end: 16 }, { start: 20, end: 4 }] },
            parque: { drink: [{ start: 6, end: 10 }], feed: [{ start: 14, end: 18 }], rest: [{ start: 10, end: 14 }, { start: 18, end: 6 }] }
        }
    },
    "roe_deer": {
        name_de: "Reh", name_en: "Roe Deer", icon: "🦌",
        class: 3, difficulty: "Extrem leicht", max_level: 3,
        max_score: 95.00, diamond: 81.86, gold: 64.37, silver: 41.04,
        fur_common: ["braun", "dunkelbraun", "dunkelgrau", "hellbraun", "orange"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
        lures: ["Rehwild-Lockpfeife (Caller)", "Rehduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 14, end: 17 }], feed: [{ start: 4, end: 10 }, { start: 17, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 10, end: 14 }, { start: 20, end: 24 }] },
            cuatro: { drink: [{ start: 12, end: 16 }], feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 8, end: 12 }, { start: 20, end: 24 }] }
        }
    },
    "fallow_deer": {
        name_de: "Damhirsch", name_en: "Fallow Deer", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 275.00, diamond: 251.92, gold: 176.00, silver: 92.00,
        fur_common: ["gefleckt", "braun", "dunkelbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
        lures: ["Damhirsch-Lockpfeife (Caller)", "Damhirschduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 10, end: 13 }], feed: [{ start: 6, end: 10 }, { start: 17, end: 21 }], rest: [{ start: 0, end: 6 }, { start: 13, end: 17 }, { start: 21, end: 24 }] },
            te_awaroa: { drink: [{ start: 8, end: 12 }], feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }] }
        }
    },
    "wild_boar": {
        name_de: "Wildschwein", name_en: "Wild Boar", icon: "🐗",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 162.00, diamond: 143.40, gold: 98.40, silver: 51.80,
        fur_common: ["dunkelbraun", "braun", "schwarz"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Wildschwein-Lockpfeife (Caller)", "Wildschweinduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 23, end: 3.5 }], feed: [{ start: 3, end: 7.5 }], rest: [{ start: 7.5, end: 23 }] },
            medved: { drink: [{ start: 0, end: 3 }], feed: [{ start: 3, end: 6 }, { start: 17, end: 24 }], rest: [{ start: 6, end: 17 }] },
            cuatro: { drink: [{ start: 22, end: 2 }], feed: [{ start: 2, end: 6 }], rest: [{ start: 6, end: 22 }] },
            parque: { drink: [{ start: 21, end: 1 }], feed: [{ start: 1, end: 5 }], rest: [{ start: 5, end: 21 }] },
            emerald: { drink: [{ start: 20, end: 0 }], feed: [{ start: 0, end: 4 }], rest: [{ start: 4, end: 20 }] },
            sundarpatan: { drink: [{ start: 19, end: 23 }], feed: [{ start: 23, end: 3 }], rest: [{ start: 3, end: 19 }] }
        }
    },
    "european_rabbit": {
        name_de: "Wildkaninchen", name_en: "European Rabbit", icon: "🐇",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 3.00, diamond: 2.60, gold: 1.80, silver: 1.00,
        fur_common: ["braun", "grau", "dunkelbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: [],
        need_zones: {
            hirschfelden: { drink: [{ start: 5, end: 9 }, { start: 12, end: 16 }, { start: 18, end: 22 }], feed: [{ start: 9, end: 12 }, { start: 16, end: 18 }], rest: [{ start: 22, end: 5 }] },
            cuatro: { drink: [{ start: 6, end: 10 }, { start: 14, end: 18 }], feed: [{ start: 10, end: 14 }], rest: [{ start: 18, end: 6 }] }
        }
    },
    "red_fox": {
        name_de: "Rotfuchs", name_en: "Red Fox", icon: "🦊",
        class: 2, difficulty: "Trivial", max_level: 3,
        max_score: 14.20, diamond: 12.50, gold: 8.60, silver: 5.00,
        fur_common: ["rot", "dunkelrot", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Fuchslockpfeife (Caller)", "Fuchsduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 17, end: 20.5 }], feed: [{ start: 0, end: 7 }, { start: 20, end: 24 }], rest: [{ start: 7, end: 17 }] },
            yukon: { drink: [{ start: 18, end: 22 }], feed: [{ start: 0, end: 6 }, { start: 22, end: 24 }], rest: [{ start: 6, end: 18 }] },
            new_england: { drink: [{ start: 16, end: 20 }], feed: [{ start: 0, end: 5 }, { start: 20, end: 24 }], rest: [{ start: 5, end: 16 }] }
        }
    },
    "ring_necked_pheasant": {
        name_de: "Fasan", name_en: "Ring-necked Pheasant", icon: "🐦",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 2.00, diamond: 1.80, gold: 1.20, silver: 0.70,
        fur_common: ["klassisch", "melanistisch"],
        fur_rare: ["leuzistisch (sehr selten)", "albinistisch (sehr selten)"],
        lures: ["Fasanlockpfeife (Caller)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 6, end: 10 }], feed: [{ start: 10, end: 18 }], rest: [{ start: 18, end: 6 }] },
            rancho: { drink: [{ start: 7, end: 11 }], feed: [{ start: 11, end: 17 }], rest: [{ start: 17, end: 7 }] }
        }
    },
    "canada_goose": {
        name_de: "Kanadagans", name_en: "Canada Goose", icon: "🦆",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 13.00, diamond: 11.50, gold: 7.80, silver: 4.20,
        fur_common: ["klassisch"],
        fur_rare: ["leuzistisch (sehr selten)"],
        lures: ["Gänseruf (Caller)", "Gänselockvögel (Decoys)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }], feed: [{ start: 10, end: 16 }], rest: [{ start: 19, end: 6 }] },
            yukon: { drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }], feed: [{ start: 9, end: 17 }], rest: [{ start: 21, end: 5 }] }
        }
    },
    "european_bison": {
        name_de: "Wisent", name_en: "European Bison", icon: "🦬",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 348.00, diamond: 298.40, gold: 221.20, silver: 106.00,
        fur_common: ["dunkelbraun", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Wisentduft (Duft)"],
        need_zones: {
            hirschfelden: { drink: [{ start: 6, end: 10 }], feed: [{ start: 0, end: 5 }], rest: [{ start: 10, end: 24 }] }
        }
    },
    // LAYTON LAKE
    "whitetail": {
        name_de: "Weißwedelhirsch", name_en: "White-tailed Deer", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 283.00, diamond: 255.09, gold: 176.00, silver: 92.00,
        fur_common: ["braun", "dunkelbraun", "hellbraun", "tan"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
        lures: ["Weißwedelhirsch-Lockpfeife (Caller)", "Weißwedelhirschduft (Duft)"],
        need_zones: {
            layton: { drink: [{ start: 8, end: 12 }], feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }] },
            rancho: { drink: [{ start: 7, end: 11 }], feed: [{ start: 3, end: 7 }, { start: 15, end: 19 }], rest: [{ start: 0, end: 3 }, { start: 11, end: 15 }, { start: 19, end: 24 }] },
            mississippi: { drink: [{ start: 6, end: 10 }], feed: [{ start: 2, end: 6 }, { start: 14, end: 18 }], rest: [{ start: 0, end: 2 }, { start: 10, end: 14 }, { start: 18, end: 24 }] },
            revontuli: { drink: [{ start: 9, end: 13 }], feed: [{ start: 5, end: 9 }, { start: 17, end: 21 }], rest: [{ start: 0, end: 5 }, { start: 13, end: 17 }, { start: 21, end: 24 }] },
            new_england: { drink: [{ start: 8, end: 12 }], feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }] }
        }
    },
    "blacktail": {
        name_de: "Schwarzwedelhirsch", name_en: "Blacktail Deer", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 180.00, diamond: 162.00, gold: 108.00, silver: 54.00,
        fur_common: ["braun", "dunkelbraun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
        lures: ["Schwarzwedelhirsch-Lockpfeife (Caller)"],
        need_zones: {
            layton: { drink: [{ start: 16, end: 20 }], feed: [{ start: 4, end: 8 }, { start: 12, end: 16 }], rest: [{ start: 0, end: 4 }, { start: 8, end: 12 }, { start: 20, end: 24 }] }
        }
    },
    "roosevelt_elk": {
        name_de: "Roosevelt-Wapiti", name_en: "Roosevelt Elk", icon: "🫎",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 450.00, diamond: 390.00, gold: 290.00, silver: 150.00,
        fur_common: ["braun", "dunkelbraun", "hellbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Wapiti-Lockpfeife (Caller)", "Wapiti-Duft (Duft)"],
        need_zones: {
            layton: { drink: [{ start: 4, end: 8 }], feed: [{ start: 8, end: 12 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }] }
        }
    },
    "moose": {
        name_de: "Elch", name_en: "Moose", icon: "🫎",
        class: 7, difficulty: "Mittel - Legendär", max_level: 9,
        max_score: 310.00, diamond: 274.99, gold: 200.00, silver: 105.00,
        fur_common: ["dunkelbraun", "braun", "hellbraun", "tan"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)", "akromelanistisch (selten)"],
        lures: ["Elch-Lockpfeife (Caller)", "Elchduft (Duft)"],
        need_zones: {
            layton: { drink: [{ start: 12, end: 16 }], feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 8, end: 12 }, { start: 20, end: 24 }] },
            medved: { drink: [{ start: 10, end: 14 }], feed: [{ start: 2, end: 6 }, { start: 18, end: 22 }], rest: [{ start: 0, end: 2 }, { start: 6, end: 10 }, { start: 14, end: 18 }, { start: 22, end: 24 }] },
            yukon: { drink: [{ start: 11, end: 15 }], feed: [{ start: 3, end: 7 }, { start: 19, end: 23 }], rest: [{ start: 0, end: 3 }, { start: 7, end: 11 }, { start: 15, end: 19 }, { start: 23, end: 24 }] },
            revontuli: { drink: [{ start: 13, end: 17 }], feed: [{ start: 5, end: 9 }, { start: 21, end: 1 }], rest: [{ start: 1, end: 5 }, { start: 9, end: 13 }, { start: 17, end: 21 }] },
            new_england: { drink: [{ start: 12, end: 16 }], feed: [{ start: 4, end: 8 }, { start: 20, end: 24 }], rest: [{ start: 0, end: 4 }, { start: 8, end: 12 }, { start: 16, end: 20 }] }
        }
    },
    "black_bear": {
        name_de: "Schwarzbär", name_en: "Black Bear", icon: "🐻",
        class: 7, difficulty: "Mittel - Legendär", max_level: 9,
        max_score: 28.00, diamond: 22.80, gold: 18.00, silver: 10.00,
        fur_common: ["schwarz", "braun", "dunkel", "dusky"],
        fur_rare: ["zimtfarben (selten)", "blond (selten)", "albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: ["Bärenruf (Caller)", "Bärenköder"],
        need_zones: {
            layton: { drink: [{ start: 4, end: 8 }], feed: [{ start: 0, end: 4 }, { start: 20, end: 24 }], rest: [{ start: 8, end: 20 }] },
            silver_ridge: { drink: [{ start: 5, end: 9 }], feed: [{ start: 1, end: 5 }, { start: 21, end: 1 }], rest: [{ start: 9, end: 21 }] },
            new_england: { drink: [{ start: 3, end: 7 }], feed: [{ start: 0, end: 3 }, { start: 19, end: 24 }], rest: [{ start: 7, end: 19 }] }
        }
    },
    "coyote": {
        name_de: "Kojote", name_en: "Coyote", icon: "🐺",
        class: 3, difficulty: "Leicht", max_level: 5,
        max_score: 28.00, diamond: 23.00, gold: 17.00, silver: 9.00,
        fur_common: ["graubraun", "braun", "hellbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Kojotenlockpfeife (Caller)", "Fleischköder"],
        need_zones: {
            layton: { drink: [{ start: 0, end: 4 }], feed: [{ start: 4, end: 7 }, { start: 17, end: 24 }], rest: [{ start: 7, end: 17 }] },
            rancho: { drink: [{ start: 1, end: 5 }], feed: [{ start: 5, end: 8 }, { start: 18, end: 1 }], rest: [{ start: 8, end: 18 }] }
        }
    },
    "jackrabbit": {
        name_de: "Eselhase", name_en: "Jackrabbit", icon: "🐇",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 1.70, diamond: 1.50, gold: 1.00, silver: 0.50,
        fur_common: ["grau", "braun"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: [],
        need_zones: {
            layton: { drink: [], feed: [{ start: 0, end: 6 }, { start: 18, end: 24 }], rest: [{ start: 6, end: 18 }] }
        }
    },
    "mallard": {
        name_de: "Stockente", name_en: "Mallard", icon: "🦆",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 1.80, diamond: 1.60, gold: 1.10, silver: 0.60,
        fur_common: ["klassisch männlich", "klassisch weiblich"],
        fur_rare: ["leuzistisch (sehr selten)"],
        lures: ["Entenlockpfeife (Caller)", "Entenlockvögel (Decoys)"],
        need_zones: {
            layton: { drink: [], feed: [{ start: 5, end: 7 }, { start: 9, end: 11 }, { start: 13, end: 15 }, { start: 17, end: 19 }], rest: [{ start: 0, end: 5 }, { start: 7, end: 9 }, { start: 11, end: 13 }, { start: 15, end: 17 }, { start: 19, end: 24 }] },
            new_england: { drink: [], feed: [{ start: 6, end: 10 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 6 }, { start: 10, end: 16 }, { start: 20, end: 24 }] }
        }
    },
    "turkey": {
        name_de: "Truthahn", name_en: "Wild Turkey", icon: "🦃",
        class: 2, difficulty: "Trivial", max_level: 3,
        max_score: 13.00, diamond: 11.70, gold: 7.80, silver: 3.90,
        fur_common: ["klassisch"],
        fur_rare: ["leuzistisch (sehr selten)", "albinistisch (sehr selten)"],
        lures: ["Truthahnlockpfeife (Caller)"],
        need_zones: {
            layton: { drink: [], feed: [{ start: 4, end: 11 }, { start: 14, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 11, end: 14 }, { start: 20, end: 24 }] },
            silver_ridge: { drink: [], feed: [{ start: 5, end: 12 }, { start: 15, end: 21 }], rest: [{ start: 0, end: 5 }, { start: 12, end: 15 }, { start: 21, end: 24 }] },
            te_awaroa: { drink: [], feed: [{ start: 5, end: 11 }, { start: 14, end: 20 }], rest: [{ start: 0, end: 5 }, { start: 11, end: 14 }, { start: 20, end: 24 }] }
        }
    },
    // MEDVED-TAIGA
    "brown_bear": {
        name_de: "Braunbär", name_en: "Brown Bear", icon: "🐻",
        class: 7, difficulty: "Mittel - Legendär", max_level: 9,
        max_score: 32.00, diamond: 27.70, gold: 21.00, silver: 11.50,
        fur_common: ["hellbraun", "rotbraun"],
        fur_rare: ["blond (selten)", "zimtfarben (selten)", "dunkelbraun (selten)", "gold (selten)", "grau (selten)", "spirit (selten)", "albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Braunbär-Lockpfeife (Caller)", "Bärenköder"],
        need_zones: {
            medved: { drink: [{ start: 20, end: 24 }], feed: [{ start: 0, end: 8 }], rest: [{ start: 8, end: 20 }] },
            revontuli: { drink: [{ start: 18, end: 22 }], feed: [{ start: 22, end: 2 }, { start: 2, end: 6 }], rest: [{ start: 6, end: 18 }] }
        }
    },
    "reindeer": {
        name_de: "Rentier", name_en: "Reindeer", icon: "🦌",
        class: 4, difficulty: "Leicht - Mittel", max_level: 5,
        max_score: 440.00, diamond: 400.00, gold: 300.00, silver: 160.00,
        fur_common: ["graubraun", "braun", "hellbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Rentier-Lockpfeife (Caller)", "Rentierduft (Duft)"],
        need_zones: {
            medved: { drink: [{ start: 4, end: 8 }], feed: [{ start: 8, end: 12 }, { start: 16, end: 20 }], rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 24 }] }
        }
    },
    "gray_wolf": {
        name_de: "Grauwolf", name_en: "Gray Wolf", icon: "🐺",
        class: 5, difficulty: "Mittel", max_level: 9,
        max_score: 35.00, diamond: 30.00, gold: 22.00, silver: 12.00,
        fur_common: ["grau", "dunkelgrau", "hellgrau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Wolfslockpfeife (Caller)"],
        need_zones: {
            medved: { drink: [{ start: 17, end: 20 }], feed: [{ start: 0, end: 6 }, { start: 20, end: 24 }], rest: [{ start: 6, end: 17 }] },
            yukon: { drink: [{ start: 16, end: 20 }], feed: [{ start: 0, end: 5 }, { start: 20, end: 24 }], rest: [{ start: 5, end: 16 }] },
            revontuli: { drink: [{ start: 18, end: 22 }], feed: [{ start: 0, end: 4 }, { start: 22, end: 24 }], rest: [{ start: 4, end: 18 }] }
        }
    },
    "eurasian_lynx": {
        name_de: "Eurasischer Luchs", name_en: "Eurasian Lynx", icon: "🐱",
        class: 4, difficulty: "Leicht - Mittel", max_level: 5,
        max_score: 30.00, diamond: 27.00, gold: 18.00, silver: 9.00,
        fur_common: ["grau", "braun", "tan"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Luchslockpfeife (Caller)"],
        need_zones: {
            medved: { drink: [{ start: 3, end: 6 }], feed: [{ start: 0, end: 3 }, { start: 20, end: 24 }], rest: [{ start: 6, end: 20 }] },
            revontuli: { drink: [{ start: 2, end: 5 }], feed: [{ start: 0, end: 2 }, { start: 21, end: 24 }], rest: [{ start: 5, end: 21 }] }
        }
    },
    "musk_deer": {
        name_de: "Moschushirsch", name_en: "Musk Deer", icon: "🦌",
        class: 3, difficulty: "Leicht", max_level: 3,
        max_score: 4.00, diamond: 3.60, gold: 2.40, silver: 1.20,
        fur_common: ["braun", "dunkelbraun"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            medved: { drink: [{ start: 8, end: 12 }], feed: [{ start: 12, end: 20 }], rest: [{ start: 0, end: 8 }, { start: 20, end: 24 }] }
        }
    },
    "western_capercaillie": {
        name_de: "Auerhuhn", name_en: "Western Capercaillie", icon: "🐦",
        class: 2, difficulty: "Trivial", max_level: 3,
        max_score: 7.00, diamond: 6.30, gold: 4.20, silver: 2.10,
        fur_common: ["klassisch männlich", "klassisch weiblich"],
        fur_rare: ["leuzistisch (sehr selten)"],
        lures: [],
        need_zones: {
            medved: { drink: [], feed: [{ start: 4, end: 11 }, { start: 14, end: 21 }], rest: [{ start: 0, end: 4 }, { start: 11, end: 14 }, { start: 21, end: 24 }] }
        }
    },
    // VURHONGA SAVANNA
    "lion": {
        name_de: "Löwe", name_en: "Lion", icon: "🦁",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 58.00, diamond: 52.20, gold: 34.80, silver: 17.40,
        fur_common: ["braun", "hellbraun", "dunkelbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Löwenlockpfeife (Caller)"],
        need_zones: {
            vurhonga: { drink: [{ start: 4, end: 8 }, { start: 18, end: 22 }], feed: [{ start: 8, end: 18 }], rest: [{ start: 22, end: 4 }] }
        }
    },
    "cape_buffalo": {
        name_de: "Kaffernbüffel", name_en: "Cape Buffalo", icon: "🐃",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 182.00, diamond: 163.80, gold: 109.20, silver: 54.60,
        fur_common: ["schwarz", "dunkelbraun"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: ["Büffelduft (Duft)"],
        need_zones: {
            vurhonga: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "blue_wildebeest": {
        name_de: "Streifengnu", name_en: "Blue Wildebeest", icon: "🦬",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 34.00, diamond: 30.60, gold: 20.40, silver: 10.20,
        fur_common: ["grau", "dunkelgrau", "blaugrau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "gemsbok": {
        name_de: "Oryx", name_en: "Gemsbok", icon: "🦌",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 44.00, diamond: 39.60, gold: 26.40, silver: 13.20,
        fur_common: ["klassisch", "hellbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: ["Oryxduft (Duft)"],
        need_zones: {
            vurhonga: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "springbok": {
        name_de: "Springbock", name_en: "Springbok", icon: "🦌",
        class: 3, difficulty: "Leicht", max_level: 3,
        max_score: 51.00, diamond: 45.90, gold: 30.60, silver: 15.30,
        fur_common: ["klassisch", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [{ start: 6, end: 11 }, { start: 15, end: 19 }], feed: [{ start: 11, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "lesser_kudu": {
        name_de: "Kleiner Kudu", name_en: "Lesser Kudu", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 33.00, diamond: 29.70, gold: 19.80, silver: 9.90,
        fur_common: ["klassisch", "braun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [{ start: 5, end: 9 }, { start: 16, end: 20 }], feed: [{ start: 9, end: 16 }], rest: [{ start: 20, end: 5 }] }
        }
    },
    "warthog": {
        name_de: "Warzenschwein", name_en: "Warthog", icon: "🐗",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 38.00, diamond: 34.20, gold: 22.80, silver: 11.40,
        fur_common: ["grau", "dunkelgrau", "braun"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [{ start: 6, end: 10 }], feed: [{ start: 10, end: 18 }], rest: [{ start: 18, end: 6 }] }
        }
    },
    "side_striped_jackal": {
        name_de: "Streifenschakal", name_en: "Side-striped Jackal", icon: "🐺",
        class: 2, difficulty: "Trivial", max_level: 3,
        max_score: 16.00, diamond: 14.40, gold: 9.60, silver: 4.80,
        fur_common: ["grau", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [{ start: 0, end: 4 }], feed: [{ start: 4, end: 8 }, { start: 18, end: 24 }], rest: [{ start: 8, end: 18 }] }
        }
    },
    "scrub_hare": {
        name_de: "Buschhase", name_en: "Scrub Hare", icon: "🐇",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 8.00, diamond: 7.20, gold: 4.80, silver: 2.40,
        fur_common: ["braun", "grau"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: [],
        need_zones: {
            vurhonga: { drink: [], feed: [{ start: 0, end: 6 }, { start: 18, end: 24 }], rest: [{ start: 6, end: 18 }] }
        }
    },
    // Additional animals for other maps
    "grizzly_bear": {
        name_de: "Grizzlybär", name_en: "Grizzly Bear", icon: "🐻",
        class: 7, difficulty: "Mittel - Legendär", max_level: 9,
        max_score: 32.00, diamond: 27.70, gold: 21.00, silver: 11.50,
        fur_common: ["braun", "dunkelbraun", "hellbraun"],
        fur_rare: ["blond (selten)", "silber (selten)", "albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Bärenruf (Caller)", "Bärenköder"],
        need_zones: {
            yukon: { drink: [{ start: 5, end: 10 }, { start: 17, end: 21 }], feed: [{ start: 10, end: 17 }], rest: [{ start: 21, end: 5 }] }
        }
    },
    "plains_bison": {
        name_de: "Präriebison", name_en: "Plains Bison", icon: "🦬",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 310.00, diamond: 279.00, gold: 186.00, silver: 93.00,
        fur_common: ["dunkelbraun", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Bisonduft (Duft)"],
        need_zones: {
            yukon: { drink: [{ start: 7, end: 11 }, { start: 16, end: 20 }], feed: [{ start: 11, end: 16 }], rest: [{ start: 20, end: 7 }] },
            silver_ridge: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "caribou": {
        name_de: "Karibu", name_en: "Caribou", icon: "🦌",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 600.00, diamond: 540.00, gold: 360.00, silver: 180.00,
        fur_common: ["braun", "dunkelbraun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Karibu-Lockpfeife (Caller)"],
        need_zones: {
            yukon: { drink: [{ start: 6, end: 12 }, { start: 18, end: 21 }], feed: [{ start: 12, end: 18 }], rest: [{ start: 21, end: 6 }] }
        }
    },
    "mule_deer": {
        name_de: "Maultierhirsch", name_en: "Mule Deer", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 340.00, diamond: 306.00, gold: 204.00, silver: 102.00,
        fur_common: ["braun", "grau", "tan"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)", "gescheckt (selten)"],
        lures: ["Maultierhirsch-Lockpfeife (Caller)", "Maultierhirschduft (Duft)"],
        need_zones: {
            silver_ridge: { drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }], feed: [{ start: 9, end: 17 }], rest: [{ start: 21, end: 5 }] },
            rancho: { drink: [{ start: 6, end: 10 }, { start: 18, end: 22 }], feed: [{ start: 10, end: 18 }], rest: [{ start: 22, end: 6 }] },
            parque: { drink: [{ start: 7, end: 11 }, { start: 16, end: 20 }], feed: [{ start: 11, end: 16 }], rest: [{ start: 20, end: 7 }] }
        }
    },
    "rocky_mountain_elk": {
        name_de: "Rocky Mountain Wapiti", name_en: "Rocky Mountain Elk", icon: "🫎",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 500.00, diamond: 450.00, gold: 300.00, silver: 150.00,
        fur_common: ["braun", "dunkelbraun", "hellbraun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Wapiti-Lockpfeife (Caller)", "Wapiti-Duft (Duft)"],
        need_zones: {
            silver_ridge: { drink: [{ start: 4, end: 9 }, { start: 16, end: 20 }], feed: [{ start: 9, end: 16 }], rest: [{ start: 20, end: 4 }] }
        }
    },
    "mountain_lion": {
        name_de: "Puma", name_en: "Mountain Lion", icon: "🐱",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 240.00, diamond: 216.00, gold: 144.00, silver: 72.00,
        fur_common: ["tan", "braun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Pumalockpfeife (Caller)"],
        need_zones: {
            silver_ridge: { drink: [{ start: 4, end: 8 }, { start: 20, end: 24 }], feed: [{ start: 8, end: 20 }], rest: [{ start: 0, end: 4 }] }
        }
    },
    "mountain_goat": {
        name_de: "Schneeziege", name_en: "Mountain Goat", icon: "🐐",
        class: 4, difficulty: "Leicht - Mittel", max_level: 5,
        max_score: 12.50, diamond: 11.25, gold: 7.50, silver: 3.75,
        fur_common: ["weiß", "grau"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: [],
        need_zones: {
            silver_ridge: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "bighorn_sheep": {
        name_de: "Dickhornschaf", name_en: "Bighorn Sheep", icon: "🐑",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 210.00, diamond: 189.00, gold: 126.00, silver: 63.00,
        fur_common: ["braun", "grau", "tan"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            silver_ridge: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] },
            rancho: { drink: [{ start: 7, end: 11 }, { start: 16, end: 20 }], feed: [{ start: 11, end: 16 }], rest: [{ start: 20, end: 7 }] }
        }
    },
    "pronghorn": {
        name_de: "Gabelbock", name_en: "Pronghorn", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 110.00, diamond: 99.00, gold: 66.00, silver: 33.00,
        fur_common: ["tan", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Gabelbock-Lockpfeife (Caller)"],
        need_zones: {
            silver_ridge: { drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }], feed: [{ start: 10, end: 16 }], rest: [{ start: 20, end: 6 }] }
        }
    },
    "puma": {
        name_de: "Puma", name_en: "Puma", icon: "🐱",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 240.00, diamond: 216.00, gold: 144.00, silver: 72.00,
        fur_common: ["tan", "braun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Pumalockpfeife (Caller)"],
        need_zones: {
            parque: { drink: [{ start: 4, end: 8 }, { start: 20, end: 24 }], feed: [{ start: 8, end: 20 }], rest: [{ start: 0, end: 4 }] }
        }
    },
    "water_buffalo": {
        name_de: "Wasserbüffel", name_en: "Water Buffalo", icon: "🐃",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 182.00, diamond: 163.80, gold: 109.20, silver: 54.60,
        fur_common: ["schwarz", "dunkelgrau"],
        fur_rare: ["albinistisch (sehr selten)"],
        lures: [],
        need_zones: {
            parque: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] },
            emerald: { drink: [{ start: 5, end: 9 }, { start: 14, end: 18 }], feed: [{ start: 9, end: 14 }], rest: [{ start: 18, end: 5 }] },
            sundarpatan: { drink: [{ start: 7, end: 11 }, { start: 16, end: 20 }], feed: [{ start: 11, end: 16 }], rest: [{ start: 20, end: 7 }] }
        }
    },
    "axis_deer": {
        name_de: "Axishirsch", name_en: "Axis Deer", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 101.00, diamond: 90.90, gold: 60.60, silver: 30.30,
        fur_common: ["gefleckt", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Axishirsch-Lockpfeife (Caller)"],
        need_zones: {
            parque: { drink: [{ start: 7, end: 11 }, { start: 15, end: 19 }], feed: [{ start: 11, end: 15 }], rest: [{ start: 19, end: 7 }] },
            emerald: { drink: [{ start: 6, end: 10 }, { start: 14, end: 18 }], feed: [{ start: 10, end: 14 }], rest: [{ start: 18, end: 6 }] },
            sundarpatan: { drink: [{ start: 8, end: 12 }, { start: 16, end: 20 }], feed: [{ start: 12, end: 16 }], rest: [{ start: 20, end: 8 }] }
        }
    },
    "blackbuck": {
        name_de: "Hirschziegenantilope", name_en: "Blackbuck", icon: "🦌",
        class: 4, difficulty: "Leicht", max_level: 5,
        max_score: 32.00, diamond: 28.80, gold: 19.20, silver: 9.60,
        fur_common: ["klassisch männlich", "klassisch weiblich"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: [],
        need_zones: {
            parque: { drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }], feed: [{ start: 10, end: 16 }], rest: [{ start: 20, end: 6 }] }
        }
    },
    "cinnamon_teal": {
        name_de: "Zimtente", name_en: "Cinnamon Teal", icon: "🦆",
        class: 1, difficulty: "Trivial", max_level: 1,
        max_score: 0.80, diamond: 0.72, gold: 0.48, silver: 0.24,
        fur_common: ["klassisch männlich", "klassisch weiblich"],
        fur_rare: ["leuzistisch (sehr selten)"],
        lures: ["Entenlockpfeife (Caller)"],
        need_zones: {
            parque: { drink: [], feed: [{ start: 5, end: 9 }, { start: 15, end: 19 }], rest: [{ start: 9, end: 15 }, { start: 19, end: 5 }] }
        }
    },
    "bengal_tiger": {
        name_de: "Bengalischer Tiger", name_en: "Bengal Tiger", icon: "🐅",
        class: 9, difficulty: "Schwer - Legendär", max_level: 9,
        max_score: 330.00, diamond: 297.00, gold: 198.00, silver: 99.00,
        fur_common: ["orange gestreift"],
        fur_rare: ["weiß (selten)", "melanistisch (sehr selten)", "albinistisch (sehr selten)"],
        lures: ["Tigerlockpfeife (Caller)"],
        need_zones: {
            sundarpatan: { drink: [{ start: 5, end: 9 }, { start: 18, end: 22 }], feed: [{ start: 9, end: 18 }], rest: [{ start: 22, end: 5 }] }
        }
    },
    "himalayan_tahr": {
        name_de: "Himalaya-Tahr", name_en: "Himalayan Tahr", icon: "🐐",
        class: 4, difficulty: "Leicht - Mittel", max_level: 5,
        max_score: 54.00, diamond: 48.60, gold: 32.40, silver: 16.20,
        fur_common: ["braun", "dunkelbraun"],
        fur_rare: ["blond (selten)", "albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            sundarpatan: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "sambar_deer": {
        name_de: "Sambarhirsch", name_en: "Sambar Deer", icon: "🦌",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 130.00, diamond: 117.00, gold: 78.00, silver: 39.00,
        fur_common: ["braun", "dunkelbraun", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: ["Sambarhirsch-Lockpfeife (Caller)"],
        need_zones: {
            emerald: { drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }], feed: [{ start: 10, end: 16 }], rest: [{ start: 20, end: 6 }] },
            sundarpatan: { drink: [{ start: 7, end: 11 }, { start: 17, end: 21 }], feed: [{ start: 11, end: 17 }], rest: [{ start: 21, end: 7 }] }
        }
    },
    "nilgai": {
        name_de: "Nilgauantilope", name_en: "Nilgai", icon: "🦌",
        class: 6, difficulty: "Mittel", max_level: 9,
        max_score: 390.00, diamond: 351.00, gold: 234.00, silver: 117.00,
        fur_common: ["grau", "blaugrau"],
        fur_rare: ["albinistisch (sehr selten)", "leuzistisch (sehr selten)"],
        lures: [],
        need_zones: {
            sundarpatan: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "blue_sheep": {
        name_de: "Blauschaf", name_en: "Blue Sheep", icon: "🐑",
        class: 4, difficulty: "Leicht - Mittel", max_level: 5,
        max_score: 75.00, diamond: 67.50, gold: 45.00, silver: 22.50,
        fur_common: ["blaugrau", "grau"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            sundarpatan: { drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }], feed: [{ start: 10, end: 15 }], rest: [{ start: 19, end: 6 }] }
        }
    },
    "indian_muntjac": {
        name_de: "Indischer Muntjak", name_en: "Indian Muntjac", icon: "🦌",
        class: 2, difficulty: "Trivial", max_level: 3,
        max_score: 4.00, diamond: 3.60, gold: 2.40, silver: 1.20,
        fur_common: ["rotbraun", "braun"],
        fur_rare: ["albinistisch (sehr selten)", "melanistisch (sehr selten)"],
        lures: [],
        need_zones: {
            emerald: { drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }], feed: [{ start: 9, end: 17 }], rest: [{ start: 21, end: 5 }] },
            sundarpatan: { drink: [{ start: 6, end: 10 }, { start: 18, end: 22 }], feed: [{ start: 10, end: 18 }], rest: [{ start: 22, end: 6 }] }
        }
    }
};

data.animals = animals;

fs.writeFileSync('./build-config/animal-data.json', JSON.stringify(data, null, 2), 'utf-8');
console.log('Generated animal-data.json with', Object.keys(animals).length, 'animals and', Object.keys(data._maps).length, 'maps');
