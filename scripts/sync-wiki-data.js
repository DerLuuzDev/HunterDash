/**
 * Wiki Data Sync Script for HunterDash
 * 
 * Fetches animal data from theHunter: COTW Fandom Wiki and updates animal-data.json
 * 
 * Usage: npm run sync:data [-- --animal <animal_id>] [-- --dry-run]
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    WIKI_BASE_URL: 'https://thehuntercotw.fandom.com/wiki/',
    ANIMAL_DATA_PATH: path.join(__dirname, '..', 'build-config', 'animal-data.json'),
    BACKUP_DIR: path.join(__dirname, '..', 'build-config', 'backups'),
    // Fields that should NOT be overwritten by wiki data
    PROTECTED_FIELDS: ['image', 'custom_notes', 'icon', 'name_de', 'name_en', 'need_zones'],
    // Request delay to be respectful to the wiki (ms)
    REQUEST_DELAY: 500,
};

// Utility: Sleep for ms
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Create backup of animal-data.json
function createBackup() {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
        fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.BACKUP_DIR, `animal-data_${timestamp}.json`);

    fs.copyFileSync(CONFIG.ANIMAL_DATA_PATH, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);

    // Clean old backups (keep last 10)
    const backups = fs.readdirSync(CONFIG.BACKUP_DIR)
        .filter(f => f.startsWith('animal-data_'))
        .sort()
        .reverse();

    if (backups.length > 10) {
        backups.slice(10).forEach(old => {
            fs.unlinkSync(path.join(CONFIG.BACKUP_DIR, old));
            console.log(`🗑️  Removed old backup: ${old}`);
        });
    }

    return backupPath;
}

// Convert animal ID to Wiki URL slug
function toWikiSlug(animalId, nameEn) {
    // Use English name if available, otherwise transform ID
    if (nameEn) {
        return nameEn.replace(/\s+/g, '_');
    }
    return animalId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');
}

// Fetch and parse a Wiki page
async function fetchWikiPage(animalId, nameEn) {
    const slug = toWikiSlug(animalId, nameEn);
    const url = CONFIG.WIKI_BASE_URL + encodeURIComponent(slug);

    try {
        console.log(`  📥 Fetching: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'HunterDash/1.2.0 (Wiki Sync Script; contact@hunterdash.app)'
            },
            timeout: 10000
        });

        return { html: response.data, url };
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`  ⚠️  Page not found for ${animalId} (${slug})`);
        } else {
            console.error(`  ❌ Error fetching ${slug}: ${error.message}`);
        }
        return null;
    }
}

// Parse infobox/portable-infobox data from Wiki HTML
function parseInfobox($) {
    const data = {};

    // Try portable infobox first (new Fandom format)
    $('.portable-infobox .pi-data').each((_, el) => {
        const label = $(el).find('.pi-data-label').text().trim().toLowerCase();
        const value = $(el).find('.pi-data-value').text().trim();

        if (label && value) {
            data[label] = value;
        }
    });

    // Fallback: standard infobox tables
    if (Object.keys(data).length === 0) {
        $('table.infobox tr, aside.portable-infobox section').each((_, el) => {
            const cells = $(el).find('td, th');
            if (cells.length >= 2) {
                const label = $(cells[0]).text().trim().toLowerCase();
                const value = $(cells[1]).text().trim();
                if (label && value) {
                    data[label] = value;
                }
            }
        });
    }

    return data;
}

// Parse trophy score tables from Wiki HTML
function parseTrophyScores($) {
    const scores = {};

    // Look for score tables (often in sections like "Scoring" or "Trophy")
    $('table').each((_, table) => {
        const $table = $(table);
        const headers = [];

        // Get headers
        $table.find('th').each((_, th) => {
            headers.push($(th).text().trim().toLowerCase());
        });

        // Check if this is a scoring table
        const isScoringTable = headers.some(h =>
            h.includes('silver') || h.includes('gold') || h.includes('diamond') || h.includes('score')
        );

        if (isScoringTable) {
            $table.find('tr').each((_, tr) => {
                const cells = $(tr).find('td');
                cells.each((i, td) => {
                    const value = $(td).text().trim();
                    const numValue = parseFloat(value.replace(/[^\d.]/g, ''));

                    if (!isNaN(numValue) && headers[i]) {
                        const header = headers[i];
                        if (header.includes('silver')) scores.silver = numValue;
                        if (header.includes('gold')) scores.gold = numValue;
                        if (header.includes('diamond')) scores.diamond = numValue;
                        if (header.includes('max')) scores.max_score = numValue;
                    }
                });
            });
        }
    });

    return scores;
}

// Extract class from page text
function parseClass($) {
    const pageText = $('body').text();
    const classMatch = pageText.match(/class\s+(\d+)/i);
    if (classMatch) {
        return parseInt(classMatch[1], 10);
    }
    return null;
}

// Extract max weight from page
function parseMaxWeight($, infobox) {
    // Check infobox first
    for (const [key, value] of Object.entries(infobox)) {
        if (key.includes('weight') || key.includes('mass')) {
            const weightMatch = value.match(/([\d.]+)\s*kg/i);
            if (weightMatch) {
                return parseFloat(weightMatch[1]);
            }
        }
    }

    // Search page text
    const pageText = $('body').text();
    const weightMatch = pageText.match(/max(?:imum)?\s+weight[:\s]*([\d.]+)\s*kg/i);
    if (weightMatch) {
        return parseFloat(weightMatch[1]);
    }

    return null;
}

// Main sync function for a single animal
async function syncAnimal(animalId, currentData, dryRun = false) {
    const nameEn = currentData.name_en;
    console.log(`\n🦌 Processing: ${nameEn || animalId}`);

    const pageData = await fetchWikiPage(animalId, nameEn);
    if (!pageData) {
        return { updated: false, changes: [] };
    }

    const $ = cheerio.load(pageData.html);
    const infobox = parseInfobox($);
    const trophyScores = parseTrophyScores($);
    const animalClass = parseClass($);
    const maxWeight = parseMaxWeight($, infobox);

    // Collect potential updates
    const updates = {};
    const changes = [];

    // Class
    if (animalClass && animalClass !== currentData.class) {
        updates.class = animalClass;
        changes.push(`class: ${currentData.class} → ${animalClass}`);
    }

    // Trophy scores
    if (trophyScores.silver && trophyScores.silver !== currentData.silver) {
        updates.silver = trophyScores.silver;
        changes.push(`silver: ${currentData.silver} → ${trophyScores.silver}`);
    }
    if (trophyScores.gold && trophyScores.gold !== currentData.gold) {
        updates.gold = trophyScores.gold;
        changes.push(`gold: ${currentData.gold} → ${trophyScores.gold}`);
    }
    if (trophyScores.diamond && trophyScores.diamond !== currentData.diamond) {
        updates.diamond = trophyScores.diamond;
        changes.push(`diamond: ${currentData.diamond} → ${trophyScores.diamond}`);
    }
    if (trophyScores.max_score && trophyScores.max_score !== currentData.max_score) {
        updates.max_score = trophyScores.max_score;
        changes.push(`max_score: ${currentData.max_score} → ${trophyScores.max_score}`);
    }

    // Max weight
    if (maxWeight && maxWeight !== currentData.max_weight_kg) {
        updates.max_weight_kg = maxWeight;
        changes.push(`max_weight_kg: ${currentData.max_weight_kg} → ${maxWeight}`);
    }

    // Log changes
    if (changes.length > 0) {
        console.log(`  📝 Changes detected:`);
        changes.forEach(c => console.log(`     - ${c}`));

        if (!dryRun) {
            // Apply updates (respecting protected fields)
            for (const [key, value] of Object.entries(updates)) {
                if (!CONFIG.PROTECTED_FIELDS.includes(key)) {
                    currentData[key] = value;
                }
            }
            return { updated: true, changes };
        } else {
            console.log(`  ℹ️  Dry run - no changes applied`);
            return { updated: false, changes };
        }
    } else {
        console.log(`  ✓ No updates needed`);
        return { updated: false, changes: [] };
    }
}

// Main execution
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  🦌 HunterDash Wiki Sync Script');
    console.log('═══════════════════════════════════════════════════');

    // Parse CLI arguments
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const singleAnimalIndex = args.indexOf('--animal');
    const singleAnimal = singleAnimalIndex !== -1 ? args[singleAnimalIndex + 1] : null;

    if (dryRun) {
        console.log('\n⚠️  DRY RUN MODE - No changes will be saved\n');
    }

    // Load animal data
    const animalData = JSON.parse(fs.readFileSync(CONFIG.ANIMAL_DATA_PATH, 'utf-8'));
    const animals = animalData.animals;

    if (!animals) {
        console.error('❌ No animals found in animal-data.json');
        process.exit(1);
    }

    // Create backup before making changes
    if (!dryRun) {
        createBackup();
    }

    // Get animal IDs to process
    const animalIds = singleAnimal ? [singleAnimal] : Object.keys(animals);

    console.log(`\n📊 Processing ${animalIds.length} animal(s)...\n`);

    let totalUpdated = 0;
    const allChanges = {};

    for (const animalId of animalIds) {
        if (!animals[animalId]) {
            console.log(`⚠️  Unknown animal: ${animalId}`);
            continue;
        }

        const result = await syncAnimal(animalId, animals[animalId], dryRun);

        if (result.updated) {
            totalUpdated++;
            allChanges[animalId] = result.changes;
        }

        // Rate limiting
        await sleep(CONFIG.REQUEST_DELAY);
    }

    // Save updated data
    if (!dryRun && totalUpdated > 0) {
        fs.writeFileSync(CONFIG.ANIMAL_DATA_PATH, JSON.stringify(animalData, null, 2), 'utf-8');
        console.log(`\n✅ Saved ${totalUpdated} update(s) to animal-data.json`);
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  📋 SYNC SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Animals processed: ${animalIds.length}`);
    console.log(`  Animals updated:   ${totalUpdated}`);

    if (Object.keys(allChanges).length > 0) {
        console.log('\n  Changes by animal:');
        for (const [id, changes] of Object.entries(allChanges)) {
            console.log(`    ${id}:`);
            changes.forEach(c => console.log(`      - ${c}`));
        }
    }

    console.log('\n✨ Sync complete!\n');
}

// Run
main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
