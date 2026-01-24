/**
 * Final batch - Add remaining COTW animals
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const svgDir = path.join(__dirname, '..', 'assets', 'animals');

const createPlaceholderSVG = (emoji = '🦌') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="#1a5f2a" opacity="0.1"/>
  <text x="32" y="38" font-size="28" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`;
};

// Final batch of missing animals
const missingAnimals = {
    // Additional ducks
    "tufted_duck": {
        "name_de": "Reiherente",
        "name_en": "Tufted Duck",
        "image": "tufted_duck.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 1.3,
        "diamond": 1.21,
        "gold": 0.95,
        "silver": 0.61,
        "max_weight_kg": 1.1,
        "great_one": false,
        "fur_common": ["schwarz-weiß", "braun"],
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

    "common_eider": {
        "name_de": "Eiderente",
        "name_en": "Common Eider",
        "image": "common_eider.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 2.8,
        "diamond": 2.6,
        "gold": 2.06,
        "silver": 1.32,
        "max_weight_kg": 2.5,
        "great_one": false,
        "fur_common": ["schwarz-weiß", "braun"],
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

    // Grayling if missing
    "white_tailed_jackrabbit": {
        "name_de": "Weißschwanz-Eselshase",
        "name_en": "White-tailed Jackrabbit",
        "image": "white_tailed_jackrabbit.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 6,
        "diamond": 5.58,
        "gold": 4.4,
        "silver": 2.84,
        "max_weight_kg": 5.5,
        "great_one": false,
        "fur_common": ["grau", "weiß", "braun"],
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

    // Snowshoe Hare
    "snowshoe_hare": {
        "name_de": "Schneeschuhhase",
        "name_en": "Snowshoe Hare",
        "image": "snowshoe_hare.svg",
        "class": 1,
        "difficulty": "Leicht",
        "max_level": 3,
        "max_score": 2.2,
        "diamond": 2.04,
        "gold": 1.61,
        "silver": 1.04,
        "max_weight_kg": 2,
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
    }
};

const emojiMap = {
    tufted_duck: '🦆',
    common_eider: '🦆',
    white_tailed_jackrabbit: '🐇',
    snowshoe_hare: '🐇'
};

let addedCount = 0;
for (const [id, animal] of Object.entries(missingAnimals)) {
    if (!data.animals[id]) {
        data.animals[id] = animal;
        addedCount++;
        console.log(`✅ Added: ${animal.name_de} (${id})`);

        const emoji = emojiMap[id] || '🦌';
        const svgPath = path.join(svgDir, `${id}.svg`);
        if (!fs.existsSync(svgPath)) {
            fs.writeFileSync(svgPath, createPlaceholderSVG(emoji));
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

// List all maps and their animal counts
console.log('\n📍 Animals per Map:');
if (data._maps) {
    data._maps.forEach(map => {
        console.log(`   ${map.id}: ${map.animals?.length || 0} animals`);
    });
}
