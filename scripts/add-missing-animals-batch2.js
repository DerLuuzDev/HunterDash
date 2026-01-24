/**
 * Add remaining missing animals to animal-data.json (Batch 2)
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const missingAnimals = {
    // More Sundarpatan animals (if needed, check existing)

    // Additional birds and small game
    "harlequin_duck": {
        "name_de": "Kragenente",
        "name_en": "Harlequin Duck",
        "image": "harlequin_duck.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 0.8,
        "diamond": 0.74,
        "gold": 0.59,
        "silver": 0.38,
        "max_weight_kg": 0.7,
        "great_one": false,
        "fur_common": ["bunt", "grau"],
        "fur_rare": ["albinistisch"],
        "lures": ["Entenlocke"],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 6, "end": 10 }, { "start": 16, "end": 20 }],
                "rest": [{ "start": 10, "end": 16 }, { "start": 20, "end": 6 }]
            }
        }
    },

    // Askiy Ridge specific
    "wood_bison": {
        "name_de": "Waldbison",
        "name_en": "Wood Bison",
        "image": "wood_bison.svg",
        "class": 9,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 330,
        "diamond": 305.05,
        "gold": 228.58,
        "silver": 119.04,
        "max_weight_kg": 1000,
        "great_one": false,
        "fur_common": ["dunkelbraun", "braun"],
        "fur_rare": ["albinistisch", "gescheckt"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 7, "end": 11 }, { "start": 16, "end": 20 }],
                "feed": [{ "start": 11, "end": 16 }],
                "rest": [{ "start": 20, "end": 7 }]
            }
        }
    },

    // Scotland (Tòrr nan Sithean) specific
    "european_badger": {
        "name_de": "Europäischer Dachs",
        "name_en": "European Badger",
        "image": "european_badger.svg",
        "class": 2,
        "difficulty": "Mittel",
        "max_level": 5,
        "max_score": 18,
        "diamond": 16.73,
        "gold": 12.84,
        "silver": 7.08,
        "max_weight_kg": 16,
        "great_one": false,
        "fur_common": ["grau", "weiß-schwarz"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": [],
        "need_zones": {
            "_default": {
                "drink": [],
                "feed": [{ "start": 20, "end": 4 }],
                "rest": [{ "start": 4, "end": 20 }]
            }
        }
    },

    // Gray wolf (different ID check)
    "common_grey_wolf": {
        "name_de": "Grauwolf",
        "name_en": "Grey Wolf",
        "image": "gray_wolf.svg",
        "class": 5,
        "difficulty": "Legendär",
        "max_level": 9,
        "max_score": 42,
        "diamond": 38.66,
        "gold": 28.16,
        "silver": 14.09,
        "max_weight_kg": 65,
        "great_one": true,
        "fur_common": ["grau", "braun", "weiß"],
        "fur_rare": ["albinistisch", "melanistisch"],
        "lures": ["Wolfs-Lockpfeife"],
        "need_zones": {
            "_default": {
                "drink": [{ "start": 17, "end": 20 }],
                "feed": [{ "start": 0, "end": 6 }, { "start": 20, "end": 24 }],
                "rest": [{ "start": 6, "end": 17 }]
            }
        }
    }
};

// Generate placeholder SVGs for new animals
const svgDir = path.join(__dirname, '..', 'assets', 'animals');

const createPlaceholderSVG = (animalId, emoji = '🦌') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="#1a5f2a" opacity="0.1"/>
  <text x="32" y="38" font-size="28" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`;
};

const emojiMap = {
    sika_deer: '🦌',
    feral_pig: '🐗',
    feral_goat: '🐐',
    chamois: '🐐',
    rio_grande_turkey: '🦃',
    antelope_jackrabbit: '🐇',
    mexican_bobcat: '🐱',
    eastern_wild_turkey: '🦃',
    bobwhite_quail: '🐦',
    eastern_cottontail: '🐇',
    gray_fox: '🦊',
    raccoon: '🦝',
    wild_hog: '🐗',
    american_alligator: '🐊',
    rock_ptarmigan: '🐦',
    black_grouse: '🐦',
    hazel_grouse: '🐦',
    raccoon_dog: '🦊',
    mountain_hare: '🐇',
    bobcat: '🐱',
    javan_rusa: '🦌',
    hog_deer: '🦌',
    banteng: '🐃',
    iberian_wolf: '🐺',
    iberian_mouflon: '🐏',
    beceite_ibex: '🐐',
    ronda_ibex: '🐐',
    harlequin_duck: '🦆',
    wood_bison: '🦬',
    european_badger: '🦡',
    common_grey_wolf: '🐺'
};

let addedCount = 0;
for (const [id, animal] of Object.entries(missingAnimals)) {
    if (!data.animals[id]) {
        data.animals[id] = animal;
        addedCount++;
        console.log(`✅ Added: ${animal.name_de} (${id})`);

        // Create SVG placeholder
        const emoji = emojiMap[id] || '🦌';
        const svgPath = path.join(svgDir, `${id}.svg`);
        if (!fs.existsSync(svgPath)) {
            fs.writeFileSync(svgPath, createPlaceholderSVG(id, emoji));
            console.log(`   📷 Created placeholder: ${id}.svg`);
        }
    } else {
        console.log(`⏭️  Already exists: ${id}`);
    }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

const totalAnimals = Object.keys(data.animals).filter(k =>
    typeof data.animals[k] === 'object' && data.animals[k].name_de
).length;

console.log(`\n✅ Added ${addedCount} new animals`);
console.log(`📊 Total animals now: ${totalAnimals}`);
