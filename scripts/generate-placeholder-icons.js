/**
 * Generate placeholder SVG icons for all animals in animal-data.json
 * Creates simple silhouette-style placeholder icons
 */

const fs = require('fs');
const path = require('path');

// Load animal data
const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const outputDir = path.join(__dirname, '..', 'assets', 'animals');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// SVG template for placeholder icons
const createPlaceholderSVG = (animalId, emoji = '🦌') => {
    // Create a simple placeholder with the emoji and animal ID
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="#1a5f2a" opacity="0.1"/>
  <text x="32" y="38" font-size="28" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`;
};

// Map animal IDs to appropriate emojis for placeholders
const emojiMap = {
    // Deer family
    red_deer: '🦌',
    whitetail: '🦌',
    mule_deer: '🦌',
    blacktail: '🦌',
    roe_deer: '🦌',
    fallow_deer: '🦌',
    axis_deer: '🦌',
    sika_deer: '🦌',
    sambar_deer: '🦌',
    hog_deer: '🦌',
    barasingha: '🦌',
    indian_muntjac: '🦌',
    musk_deer: '🦌',

    // Elk/Moose
    moose: '🫎',
    roosevelt_elk: '🫎',
    rocky_mountain_elk: '🫎',
    manitoban_elk: '🫎',

    // Bears
    black_bear: '🐻',
    brown_bear: '🐻',
    grizzly_bear: '🐻',

    // Wolves & Canines
    gray_wolf: '🐺',
    iberian_wolf: '🐺',
    coyote: '🐺',
    red_fox: '🦊',
    gray_fox: '🦊',
    tibetan_fox: '🦊',
    side_striped_jackal: '🦊',
    raccoon_dog: '🦊',

    // Cats
    lion: '🦁',
    mountain_lion: '🐱',
    puma: '🐱',
    eurasian_lynx: '🐱',
    bobcat: '🐱',
    mexican_bobcat: '🐱',
    bengal_tiger: '🐅',
    snow_leopard: '🐆',

    // Boars & Pigs
    wild_boar: '🐗',
    feral_pig: '🐗',
    wild_hog: '🐗',
    warthog: '🐗',
    collared_peccary: '🐗',

    // Bison & Buffalo
    european_bison: '🦬',
    plains_bison: '🦬',
    wood_bison: '🦬',
    cape_buffalo: '🐃',
    water_buffalo: '🐃',
    blue_wildebeest: '🦬',
    wild_yak: '🐃',
    banteng: '🐃',

    // Goats & Sheep
    mountain_goat: '🐐',
    feral_goat: '🐐',
    bighorn_sheep: '🐏',
    iberian_mouflon: '🐏',
    beceite_ibex: '🐐',
    ronda_ibex: '🐐',
    chamois: '🐐',
    himalayan_tahr: '🐐',
    blue_sheep: '🐏',
    nilgai: '🐂',

    // Birds
    canada_goose: '🦆',
    greylag_goose: '🦆',
    tundra_bean_goose: '🦆',
    mallard: '🦆',
    eurasian_wigeon: '🦆',
    cinnamon_teal: '🦆',
    eurasian_teal: '🦆',
    goldeneye: '🦆',
    ring_necked_pheasant: '🐦',
    merriam_turkey: '🦃',
    eastern_wild_turkey: '🦃',
    rio_grande_turkey: '🦃',
    western_capercaillie: '🐦',
    black_grouse: '🐦',
    hazel_grouse: '🐦',
    rock_ptarmigan: '🐦',
    willow_ptarmigan: '🐦',
    bobwhite_quail: '🐦',
    stubble_quail: '🐦',

    // Rabbits & Hares
    european_rabbit: '🐇',
    jackrabbit: '🐇',
    antelope_jackrabbit: '🐇',
    eastern_cottontail: '🐇',
    scrub_hare: '🐇',
    european_hare: '🐇',
    mountain_hare: '🐇',
    woolly_hare: '🐇',

    // Antelope
    springbok: '🦌',
    gemsbok: '🦌',
    lesser_kudu: '🦌',
    blackbuck: '🦌',
    pronghorn: '🦌',

    // Caribou/Reindeer
    reindeer: '🦌',
    caribou: '🦌',
    woodland_caribou: '🦌',

    // Other
    raccoon: '🦝',
    european_badger: '🦡',
    beaver: '🦫',
    american_alligator: '🐊',
    saltwater_crocodile: '🐊',

    // Default
    unknown: '🦌'
};

console.log('Generating placeholder SVG icons...\n');

let count = 0;
for (const [animalId, animal] of Object.entries(data.animals)) {
    // Skip malformed entries
    if (typeof animal !== 'object' || !animal.name_de) continue;

    const emoji = emojiMap[animalId] || '🦌';
    const svg = createPlaceholderSVG(animalId, emoji);
    const outputPath = path.join(outputDir, `${animalId}.svg`);

    fs.writeFileSync(outputPath, svg, 'utf-8');
    count++;
    console.log(`✅ Created: ${animalId}.svg`);
}

// Create unknown.png fallback as SVG
const unknownSvg = createPlaceholderSVG('unknown', '❓');
fs.writeFileSync(path.join(outputDir, 'unknown.svg'), unknownSvg, 'utf-8');

console.log(`\n✅ Generated ${count} placeholder icons`);
console.log(`📁 Output directory: ${outputDir}`);
console.log('\n⚠️  Note: These are SVG placeholders. For production, replace with actual PNG images.');
