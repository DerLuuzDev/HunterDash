/**
 * Add all missing animals to animal-data.json
 * Complete COTW animal database with accurate data
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Missing animals to add
const missingAnimals = {
    // Hirschfelden missing

    // Layton Lake District
    "merriam_turkey": {
        "name_de": "Merriam-Truthahn",
        "name_en": "Merriam Turkey",
        "image": "merriam_turkey.svg",
        "class": 1,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 25,
        "diamond": 23.5,
        "gold": 19.5,
        "silver": 14,
        "max_weight_kg": 11,
        "great_one": false,
        "fur_common": ["braun", "kupfer"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Truthahn-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }],
                "feed": [{ "start": 9, "end": 17 }],
                "rest": [{ "start": 17, "end": 5 }]
            }
        }
    },

    // Te Awaroa
    "sika_deer": {
        "name_de": "Sikahirsch",
        "name_en": "Sika Deer",
        "image": "sika_deer.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 195,
        "diamond": 176.98,
        "gold": 131.44,
        "silver": 73.45,
        "max_weight_kg": 70,
        "great_one": false,
        "fur_common": ["braun", "dunkelbraun", "hellbraun"],
        "fur_rare": ["albinistisch", "melanistisch", "gescheckt"],
        "lures": ["Sikahirsch-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 17, "end": 21 }],
                "feed": [{ "start": 9, "end": 17 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    "feral_pig": {
        "name_de": "Wildes Hausschwein",
        "name_en": "Feral Pig",
        "image": "feral_pig.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 103,
        "diamond": 94.79,
        "gold": 69.75,
        "silver": 37.8,
        "max_weight_kg": 100,
        "great_one": false,
        "fur_common": ["schwarz", "braun", "gefleckt"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Wildschwein-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 4, "end": 8 }, { "start": 20, "end": 24 }],
                "feed": [{ "start": 8, "end": 20 }],
                "rest": [{ "start": 0, "end": 4 }]
            }
        }
    },

    "feral_goat": {
        "name_de": "Verwilderte Ziege",
        "name_en": "Feral Goat",
        "image": "feral_goat.svg",
        "class": 3,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 84,
        "diamond": 78.12,
        "gold": 61.6,
        "silver": 39.48,
        "max_weight_kg": 60,
        "great_one": false,
        "fur_common": ["schwarz", "weiß", "braun", "gescheckt"],
        "fur_rare": ["albinistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 15, "end": 19 }],
                "feed": [{ "start": 10, "end": 15 }],
                "rest": [{ "start": 19, "end": 6 }]
            }
        }
    },

    "chamois": {
        "name_de": "Gämse",
        "name_en": "Chamois",
        "image": "chamois.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 45,
        "diamond": 41.91,
        "gold": 32.74,
        "silver": 20.81,
        "max_weight_kg": 50,
        "great_one": false,
        "fur_common": ["braun", "dunkelbraun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 15, "end": 19 }],
                "feed": [{ "start": 10, "end": 15 }],
                "rest": [{ "start": 19, "end": 6 }]
            }
        }
    },

    // Rancho del Arroyo
    "rio_grande_turkey": {
        "name_de": "Rio-Grande-Truthahn",
        "name_en": "Rio Grande Turkey",
        "image": "rio_grande_turkey.svg",
        "class": 1,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 25,
        "diamond": 23.5,
        "gold": 19.5,
        "silver": 14,
        "max_weight_kg": 10,
        "great_one": false,
        "fur_common": ["braun", "kupfer"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Truthahn-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 16, "end": 19 }],
                "feed": [{ "start": 9, "end": 16 }],
                "rest": [{ "start": 19, "end": 5 }]
            }
        }
    },

    "antelope_jackrabbit": {
        "name_de": "Antilopenhase",
        "name_en": "Antelope Jackrabbit",
        "image": "antelope_jackrabbit.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 4.8,
        "diamond": 4.46,
        "gold": 3.52,
        "silver": 2.27,
        "max_weight_kg": 4.5,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 8 }, { "start": 18, "end": 21 }],
                "feed": [{ "start": 8, "end": 18 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    "mexican_bobcat": {
        "name_de": "Mexikanischer Rotluchs",
        "name_en": "Mexican Bobcat",
        "image": "mexican_bobcat.svg",
        "class": 4,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 15,
        "diamond": 13.97,
        "gold": 10.53,
        "silver": 5.74,
        "max_weight_kg": 18,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Räuberlockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 20, "end": 24 }],
                "feed": [{ "start": 9, "end": 20 }],
                "rest": [{ "start": 0, "end": 5 }]
            }
        }
    },

    // Mississippi Acres
    "eastern_wild_turkey": {
        "name_de": "Östlicher Wildtruthahn",
        "name_en": "Eastern Wild Turkey",
        "image": "eastern_wild_turkey.svg",
        "class": 1,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 25,
        "diamond": 23.5,
        "gold": 19.5,
        "silver": 14,
        "max_weight_kg": 11,
        "great_one": false,
        "fur_common": ["braun", "kupfer"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Truthahn-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 16, "end": 19 }],
                "feed": [{ "start": 9, "end": 16 }],
                "rest": [{ "start": 19, "end": 5 }]
            }
        }
    },

    "bobwhite_quail": {
        "name_de": "Virginiawachtel",
        "name_en": "Bobwhite Quail",
        "image": "bobwhite_quail.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 0.32,
        "diamond": 0.3,
        "gold": 0.24,
        "silver": 0.16,
        "max_weight_kg": 0.28,
        "great_one": false,
        "fur_common": ["braun", "weiß"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "rest": [{ "start": 10, "end": 16 }, { "start": 20, "end": 6 }]
            }
        }
    },

    "eastern_cottontail": {
        "name_de": "Florida-Waldkaninchen",
        "name_en": "Eastern Cottontail",
        "image": "eastern_cottontail.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 1.8,
        "diamond": 1.67,
        "gold": 1.32,
        "silver": 0.85,
        "max_weight_kg": 1.6,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 8 }, { "start": 18, "end": 21 }],
                "feed": [{ "start": 8, "end": 18 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    "gray_fox": {
        "name_de": "Graufuchs",
        "name_en": "Gray Fox",
        "image": "gray_fox.svg",
        "class": 2,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 7.2,
        "diamond": 6.59,
        "gold": 4.74,
        "silver": 2.26,
        "max_weight_kg": 6,
        "great_one": false,
        "fur_common": ["grau", "silber"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Räuberlockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 17, "end": 21 }],
                "feed": [{ "start": 9, "end": 17 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    "raccoon": {
        "name_de": "Waschbär",
        "name_en": "Raccoon",
        "image": "raccoon.svg",
        "class": 2,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 16,
        "diamond": 14.88,
        "gold": 11.2,
        "silver": 6.08,
        "max_weight_kg": 14,
        "great_one": false,
        "fur_common": ["grau", "braun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 20, "end": 24 }],
                "feed": [{ "start": 0, "end": 4 }],
                "rest": [{ "start": 8, "end": 20 }]
            }
        }
    },

    "wild_hog": {
        "name_de": "Wildschwein (US)",
        "name_en": "Wild Hog",
        "image": "wild_hog.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 270,
        "diamond": 250.79,
        "gold": 189.49,
        "silver": 103.81,
        "max_weight_kg": 200,
        "great_one": false,
        "fur_common": ["schwarz", "braun", "gefleckt"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Wildschwein-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 4, "end": 8 }, { "start": 20, "end": 24 }],
                "feed": [{ "start": 8, "end": 20 }],
                "rest": [{ "start": 0, "end": 4 }]
            }
        }
    },

    "american_alligator": {
        "name_de": "Mississippi-Alligator",
        "name_en": "American Alligator",
        "image": "american_alligator.svg",
        "class": 7,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 4.5,
        "diamond": 4.17,
        "gold": 3.22,
        "silver": 1.93,
        "max_weight_kg": 450,
        "great_one": false,
        "fur_common": ["grün", "dunkelgrün"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 8, "end": 16 }],
                "rest": [{ "start": 16, "end": 8 }]
            }
        }
    },

    // Revontuli Coast
    "rock_ptarmigan": {
        "name_de": "Alpenschneehuhn",
        "name_en": "Rock Ptarmigan",
        "image": "rock_ptarmigan.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 0.75,
        "diamond": 0.7,
        "gold": 0.55,
        "silver": 0.36,
        "max_weight_kg": 0.65,
        "great_one": false,
        "fur_common": ["weiß", "grau"],
        "fur_rare": ["albinistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 5, "end": 9 }, { "start": 15, "end": 19 }],
                "rest": [{ "start": 9, "end": 15 }, { "start": 19, "end": 5 }]
            }
        }
    },

    "black_grouse": {
        "name_de": "Birkhuhn",
        "name_en": "Black Grouse",
        "image": "black_grouse.svg",
        "class": 1,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 1.92,
        "diamond": 1.78,
        "gold": 1.4,
        "silver": 0.9,
        "max_weight_kg": 1.75,
        "great_one": false,
        "fur_common": ["schwarz", "braun"],
        "fur_rare": ["albinistisch", "leuzistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 4, "end": 10 }, { "start": 16, "end": 20 }],
                "rest": [{ "start": 10, "end": 16 }, { "start": 20, "end": 4 }]
            }
        }
    },

    "hazel_grouse": {
        "name_de": "Haselhuhn",
        "name_en": "Hazel Grouse",
        "image": "hazel_grouse.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 0.52,
        "diamond": 0.48,
        "gold": 0.38,
        "silver": 0.24,
        "max_weight_kg": 0.45,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 5, "end": 10 }, { "start": 15, "end": 19 }],
                "rest": [{ "start": 10, "end": 15 }, { "start": 19, "end": 5 }]
            }
        }
    },

    "raccoon_dog": {
        "name_de": "Marderhund",
        "name_en": "Raccoon Dog",
        "image": "raccoon_dog.svg",
        "class": 2,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 12,
        "diamond": 11.13,
        "gold": 8.58,
        "silver": 4.87,
        "max_weight_kg": 10,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 18, "end": 22 }],
                "feed": [{ "start": 0, "end": 6 }, { "start": 22, "end": 24 }],
                "rest": [{ "start": 6, "end": 18 }]
            }
        }
    },

    "mountain_hare": {
        "name_de": "Schneehase",
        "name_en": "Mountain Hare",
        "image": "mountain_hare.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 5.5,
        "diamond": 5.12,
        "gold": 4.04,
        "silver": 2.6,
        "max_weight_kg": 5,
        "great_one": false,
        "fur_common": ["weiß", "braun"],
        "fur_rare": ["albinistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 8 }, { "start": 18, "end": 21 }],
                "feed": [{ "start": 8, "end": 18 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    // New England Mountains
    "bobcat": {
        "name_de": "Rotluchs",
        "name_en": "Bobcat",
        "image": "bobcat.svg",
        "class": 4,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 15,
        "diamond": 13.97,
        "gold": 10.53,
        "silver": 5.74,
        "max_weight_kg": 18,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Räuberlockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 20, "end": 24 }],
                "feed": [{ "start": 9, "end": 20 }],
                "rest": [{ "start": 0, "end": 5 }]
            }
        }
    },

    // Emerald Coast
    "javan_rusa": {
        "name_de": "Mähnenhirsch",
        "name_en": "Javan Rusa",
        "image": "javan_rusa.svg",
        "class": 6,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 260,
        "diamond": 238.2,
        "gold": 174.44,
        "silver": 92.56,
        "max_weight_kg": 160,
        "great_one": false,
        "fur_common": ["braun", "dunkelbraun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Hirschlockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 5, "end": 9 }, { "start": 17, "end": 21 }],
                "feed": [{ "start": 9, "end": 17 }],
                "rest": [{ "start": 21, "end": 5 }]
            }
        }
    },

    "hog_deer": {
        "name_de": "Schweinshirsch",
        "name_en": "Hog Deer",
        "image": "hog_deer.svg",
        "class": 3,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 42,
        "diamond": 38.5,
        "gold": 28.7,
        "silver": 15.9,
        "max_weight_kg": 50,
        "great_one": false,
        "fur_common": ["braun", "hellbraun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 18, "end": 22 }],
                "feed": [{ "start": 10, "end": 18 }],
                "rest": [{ "start": 22, "end": 6 }]
            }
        }
    },

    "banteng": {
        "name_de": "Banteng",
        "name_en": "Banteng",
        "image": "banteng.svg",
        "class": 9,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 95,
        "diamond": 88.34,
        "gold": 67.96,
        "silver": 39.7,
        "max_weight_kg": 900,
        "great_one": false,
        "fur_common": ["braun", "schwarz"],
        "fur_rare": ["albinistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "feed": [{ "start": 10, "end": 16 }],
                "rest": [{ "start": 20, "end": 6 }]
            }
        }
    },

    // Cuatro Colinas
    "iberian_wolf": {
        "name_de": "Iberischer Wolf",
        "name_en": "Iberian Wolf",
        "image": "iberian_wolf.svg",
        "class": 5,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 42,
        "diamond": 38.66,
        "gold": 28.16,
        "silver": 14.09,
        "max_weight_kg": 45,
        "great_one": false,
        "fur_common": ["grau", "braun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Wolfs-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 17, "end": 20 }],
                "feed": [{ "start": 0, "end": 6 }, { "start": 20, "end": 24 }],
                "rest": [{ "start": 6, "end": 17 }]
            }
        }
    },

    "iberian_mouflon": {
        "name_de": "Iberisches Mufflon",
        "name_en": "Iberian Mouflon",
        "image": "iberian_mouflon.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 96,
        "diamond": 89.28,
        "gold": 68.68,
        "silver": 40.14,
        "max_weight_kg": 55,
        "great_one": false,
        "fur_common": ["braun", "hellbraun"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "feed": [{ "start": 10, "end": 16 }],
                "rest": [{ "start": 20, "end": 6 }]
            }
        }
    },

    "beceite_ibex": {
        "name_de": "Beceite-Steinbock",
        "name_en": "Beceite Ibex",
        "image": "beceite_ibex.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 153,
        "diamond": 140.12,
        "gold": 103.45,
        "silver": 55.45,
        "max_weight_kg": 90,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "feed": [{ "start": 10, "end": 16 }],
                "rest": [{ "start": 20, "end": 6 }]
            }
        }
    },

    "ronda_ibex": {
        "name_de": "Ronda-Steinbock",
        "name_en": "Ronda Ibex",
        "image": "ronda_ibex.svg",
        "class": 4,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 107,
        "diamond": 98.18,
        "gold": 73.08,
        "silver": 39.78,
        "max_weight_kg": 80,
        "great_one": false,
        "fur_common": ["braun", "grau"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "feed": [{ "start": 10, "end": 16 }],
                "rest": [{ "start": 20, "end": 6 }]
            }
        }
    }
};

// Add missing animals to data
let addedCount = 0;
for (const [id, animal] of Object.entries(missingAnimals)) {
    if (!data.animals[id]) {
        data.animals[id] = animal;
        addedCount++;
        console.log(`✅ Added: ${animal.name_de} (${id})`);
    } else {
        console.log(`⏭️  Already exists: ${id}`);
    }
}

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✅ Added ${addedCount} new animals`);
console.log(`📊 Total animals now: ${Object.keys(data.animals).filter(k => typeof data.animals[k] === 'object' && data.animals[k].name_de).length}`);
