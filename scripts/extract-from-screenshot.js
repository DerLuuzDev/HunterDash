#!/usr/bin/env node
/**
 * Screenshot-to-JSON Data Extractor for HunterDash
 * 
 * Extracts animal data from espis.de screenshots using OCR
 * and updates animal-data.json
 * 
 * Usage: node scripts/extract-from-screenshot.js <screenshot.png> --map <map_id>
 * 
 * Example: node scripts/extract-from-screenshot.js red_deer.png --map hirschfelden
 */

const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const readline = require('readline-sync');

// ============================================
// CONFIG
// ============================================

const ANIMAL_DATA_PATH = path.join(__dirname, '../build-config/animal-data.json');

// Map German field names to JSON keys
const FIELD_MAPPING = {
    'klasse': 'class',
    'stufe': 'max_level',
    'level': 'max_level',
    'max. score': 'max_score',
    'maxscore': 'max_score',
    'diamond': 'diamond',
    'dia': 'diamond',
    'gold': 'gold',
    'silver': 'silver',
    'silber': 'silver',
    'bronze': 'silver',
};

// Map German need zone names
const NEED_ZONE_MAPPING = {
    'trinken': 'drink',
    'fressen': 'feed',
    'ruhen': 'rest',
    'drinking': 'drink',
    'feeding': 'feed',
    'resting': 'rest',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse time ranges like "05:00 - 09:00" or "5:00-9:00"
 */
function parseTimeRanges(text) {
    const ranges = [];
    // Match patterns like "05:00 - 09:00" or "5-9" or "05:00 – 09:00"
    const regex = /(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const startHour = parseInt(match[1], 10);
        const endHour = parseInt(match[3], 10);

        if (startHour >= 0 && startHour <= 24 && endHour >= 0 && endHour <= 24) {
            ranges.push({ start: startHour, end: endHour });
        }
    }

    return ranges;
}

/**
 * Parse numeric values with German/English decimal separators
 */
function parseNumber(text) {
    if (!text) return null;
    // Replace comma with dot for German decimals
    const cleaned = text.replace(',', '.').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Extract the animal name from OCR text
 */
function extractAnimalName(text) {
    // Look for patterns like "Rothirsch" or "Red Deer"
    // Usually appears at the top of the page
    const lines = text.split('\n').filter(l => l.trim().length > 2);

    if (lines.length > 0) {
        // First non-empty line is often the title
        const firstLine = lines[0].trim();
        // Clean up
        return firstLine.replace(/[^a-zA-ZäöüÄÖÜß\s-]/g, '').trim();
    }

    return null;
}

/**
 * Parse trophy scores from text
 */
function extractTrophyScores(text) {
    const scores = {};
    const textLower = text.toLowerCase();

    // Diamond score patterns
    const diaPatterns = [
        /(?:diamond|dia)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/gi,
        /(\d+(?:[.,]\d+)?)\s*(?:diamond|dia)/gi,
    ];

    for (const pattern of diaPatterns) {
        const match = pattern.exec(textLower);
        if (match) {
            scores.diamond = parseNumber(match[1]);
            break;
        }
    }

    // Gold score
    const goldMatch = /(?:gold)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i.exec(textLower);
    if (goldMatch) {
        scores.gold = parseNumber(goldMatch[1]);
    }

    // Silver score
    const silverMatch = /(?:silver|silber)\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i.exec(textLower);
    if (silverMatch) {
        scores.silver = parseNumber(silverMatch[1]);
    }

    return scores;
}

/**
 * Parse class (1-9) from text
 */
function extractClass(text) {
    const match = /(?:klasse|class)\s*[:=]?\s*(\d)/i.exec(text);
    if (match) {
        const cls = parseInt(match[1], 10);
        if (cls >= 1 && cls <= 9) return cls;
    }
    return null;
}

/**
 * Parse need zones from text
 */
function extractNeedZones(text) {
    const zones = { drink: [], feed: [], rest: [] };
    const lines = text.split('\n');

    for (const line of lines) {
        const lineLower = line.toLowerCase();

        for (const [germanKey, englishKey] of Object.entries(NEED_ZONE_MAPPING)) {
            if (lineLower.includes(germanKey)) {
                const ranges = parseTimeRanges(line);
                if (ranges.length > 0) {
                    zones[englishKey] = zones[englishKey].concat(ranges);
                }
            }
        }
    }

    return zones;
}

/**
 * Find an animal in the JSON data by name (fuzzy match)
 */
function findAnimalByName(animalData, searchName) {
    if (!searchName) return null;

    const searchLower = searchName.toLowerCase().trim();

    for (const [animalId, animal] of Object.entries(animalData.animals)) {
        const nameDeLower = (animal.name_de || '').toLowerCase();
        const nameEnLower = (animal.name_en || '').toLowerCase();

        // Exact match
        if (nameDeLower === searchLower || nameEnLower === searchLower) {
            return { id: animalId, data: animal };
        }

        // Partial match
        if (nameDeLower.includes(searchLower) || searchLower.includes(nameDeLower) ||
            nameEnLower.includes(searchLower) || searchLower.includes(nameEnLower)) {
            return { id: animalId, data: animal };
        }
    }

    return null;
}

// ============================================
// MAIN OCR EXTRACTION
// ============================================

async function extractDataFromScreenshot(imagePath) {
    console.log('\n🔍 Starte OCR-Analyse...');
    console.log(`   Bild: ${imagePath}`);

    // Run Tesseract OCR with German + English
    const result = await Tesseract.recognize(
        imagePath,
        'deu+eng', // Both German and English
        {
            logger: m => {
                if (m.status === 'recognizing text') {
                    process.stdout.write(`\r   Fortschritt: ${Math.round(m.progress * 100)}%`);
                }
            }
        }
    );

    console.log('\n   ✅ OCR abgeschlossen!\n');

    const text = result.data.text;

    // Extract data from OCR text
    const extractedData = {
        raw_text: text,
        animal_name: extractAnimalName(text),
        class: extractClass(text),
        trophy_scores: extractTrophyScores(text),
        need_zones: extractNeedZones(text),
    };

    return extractedData;
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  HunterDash - Screenshot Data Extractor');
    console.log('  OCR-basierte Datenextraktion von espis.de Screenshots');
    console.log('═══════════════════════════════════════════════════════════');

    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('\n❌ Fehler: Kein Screenshot angegeben!\n');
        console.log('Verwendung:');
        console.log('  node scripts/extract-from-screenshot.js <screenshot.png> --map <map_id>\n');
        console.log('Beispiel:');
        console.log('  node scripts/extract-from-screenshot.js red_deer.png --map hirschfelden\n');
        console.log('Verfügbare Maps:');
        console.log('  hirschfelden, layton, medved, vurhonga, parque, yukon,');
        console.log('  cuatro, silver_ridge, te_awaroa, rancho, mississippi,');
        console.log('  revontuli, new_england, emerald, sundarpatan, salzwiesen, scotland\n');
        process.exit(1);
    }

    const imagePath = args[0];

    // Check if image exists
    if (!fs.existsSync(imagePath)) {
        console.log(`\n❌ Fehler: Datei nicht gefunden: ${imagePath}\n`);
        process.exit(1);
    }

    // Parse --map argument
    let mapId = null;
    const mapIndex = args.indexOf('--map');
    if (mapIndex !== -1 && args[mapIndex + 1]) {
        mapId = args[mapIndex + 1].toLowerCase();
    }

    // If no map specified, ask user
    if (!mapId) {
        console.log('\n📍 Für welche Karte sollen die Need Zones gespeichert werden?');
        mapId = readline.question('   Map-ID eingeben (z.B. hirschfelden): ').toLowerCase().trim();
    }

    if (!mapId) {
        console.log('\n❌ Fehler: Keine Map angegeben!\n');
        process.exit(1);
    }

    // Run OCR extraction
    let extractedData;
    try {
        extractedData = await extractDataFromScreenshot(imagePath);
    } catch (error) {
        console.log(`\n❌ OCR-Fehler: ${error.message}\n`);
        process.exit(1);
    }

    // Display extracted data
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📊 Extrahierte Daten');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`  🐾 Tiername (erkannt): ${extractedData.animal_name || '(nicht erkannt)'}`);
    console.log(`  📍 Ziel-Map: ${mapId}`);
    console.log(`  🎯 Klasse: ${extractedData.class || '(nicht erkannt)'}`);

    if (extractedData.trophy_scores.diamond || extractedData.trophy_scores.gold || extractedData.trophy_scores.silver) {
        console.log('\n  🏆 Trophy Scores:');
        if (extractedData.trophy_scores.diamond) console.log(`     Diamond: ${extractedData.trophy_scores.diamond}`);
        if (extractedData.trophy_scores.gold) console.log(`     Gold: ${extractedData.trophy_scores.gold}`);
        if (extractedData.trophy_scores.silver) console.log(`     Silver: ${extractedData.trophy_scores.silver}`);
    }

    const hasNeedZones = extractedData.need_zones.drink.length > 0 ||
        extractedData.need_zones.feed.length > 0 ||
        extractedData.need_zones.rest.length > 0;

    if (hasNeedZones) {
        console.log('\n  ⏰ Need Zones:');
        if (extractedData.need_zones.drink.length > 0) {
            console.log(`     Trinken: ${extractedData.need_zones.drink.map(z => `${z.start}:00-${z.end}:00`).join(', ')}`);
        }
        if (extractedData.need_zones.feed.length > 0) {
            console.log(`     Fressen: ${extractedData.need_zones.feed.map(z => `${z.start}:00-${z.end}:00`).join(', ')}`);
        }
        if (extractedData.need_zones.rest.length > 0) {
            console.log(`     Ruhen: ${extractedData.need_zones.rest.map(z => `${z.start}:00-${z.end}:00`).join(', ')}`);
        }
    } else {
        console.log('\n  ⚠️ Keine Need Zones erkannt');
    }

    console.log('\n═══════════════════════════════════════════════════════════');

    // Load animal data
    let animalData;
    try {
        animalData = JSON.parse(fs.readFileSync(ANIMAL_DATA_PATH, 'utf-8'));
    } catch (error) {
        console.log(`\n❌ Fehler beim Laden von animal-data.json: ${error.message}\n`);
        process.exit(1);
    }

    // Try to find the animal
    let matchedAnimal = findAnimalByName(animalData, extractedData.animal_name);

    if (!matchedAnimal) {
        console.log('\n⚠️ Tier konnte nicht automatisch zugeordnet werden.');
        const manualName = readline.question('   Tiername manuell eingeben (oder Enter zum Abbrechen): ').trim();

        if (!manualName) {
            console.log('\n❌ Abgebrochen.\n');
            process.exit(0);
        }

        matchedAnimal = findAnimalByName(animalData, manualName);

        if (!matchedAnimal) {
            // Try to find by ID
            if (animalData.animals[manualName.toLowerCase().replace(/\s+/g, '_')]) {
                matchedAnimal = {
                    id: manualName.toLowerCase().replace(/\s+/g, '_'),
                    data: animalData.animals[manualName.toLowerCase().replace(/\s+/g, '_')]
                };
            }
        }

        if (!matchedAnimal) {
            console.log(`\n❌ Tier "${manualName}" nicht in animal-data.json gefunden.\n`);
            process.exit(1);
        }
    }

    console.log(`\n✅ Tier gefunden: ${matchedAnimal.data.name_de} (${matchedAnimal.id})`);

    // Build update preview
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  📝 Vorschau der Änderungen');
    console.log('═══════════════════════════════════════════════════════════\n');

    const updates = {};

    if (extractedData.class && extractedData.class !== matchedAnimal.data.class) {
        updates.class = extractedData.class;
        console.log(`  Klasse: ${matchedAnimal.data.class || '(leer)'} → ${extractedData.class}`);
    }

    if (extractedData.trophy_scores.diamond &&
        Math.abs(extractedData.trophy_scores.diamond - (matchedAnimal.data.diamond || 0)) > 0.1) {
        updates.diamond = extractedData.trophy_scores.diamond;
        console.log(`  Diamond: ${matchedAnimal.data.diamond || '(leer)'} → ${extractedData.trophy_scores.diamond}`);
    }

    if (extractedData.trophy_scores.gold &&
        Math.abs(extractedData.trophy_scores.gold - (matchedAnimal.data.gold || 0)) > 0.1) {
        updates.gold = extractedData.trophy_scores.gold;
        console.log(`  Gold: ${matchedAnimal.data.gold || '(leer)'} → ${extractedData.trophy_scores.gold}`);
    }

    if (extractedData.trophy_scores.silver &&
        Math.abs(extractedData.trophy_scores.silver - (matchedAnimal.data.silver || 0)) > 0.1) {
        updates.silver = extractedData.trophy_scores.silver;
        console.log(`  Silver: ${matchedAnimal.data.silver || '(leer)'} → ${extractedData.trophy_scores.silver}`);
    }

    if (hasNeedZones) {
        updates.need_zones = { [mapId]: extractedData.need_zones };
        console.log(`  Need Zones für "${mapId}": Wird aktualisiert`);
    }

    if (Object.keys(updates).length === 0) {
        console.log('  (Keine Änderungen erkannt)\n');
        process.exit(0);
    }

    console.log('\n═══════════════════════════════════════════════════════════');

    // Ask for confirmation
    const confirm = readline.question('\n💾 Änderungen speichern? (j/n): ').toLowerCase().trim();

    if (confirm !== 'j' && confirm !== 'ja' && confirm !== 'y' && confirm !== 'yes') {
        console.log('\n❌ Abgebrochen. Keine Änderungen gespeichert.\n');
        process.exit(0);
    }

    // Apply updates
    const animal = animalData.animals[matchedAnimal.id];

    if (updates.class) animal.class = updates.class;
    if (updates.diamond) animal.diamond = updates.diamond;
    if (updates.gold) animal.gold = updates.gold;
    if (updates.silver) animal.silver = updates.silver;

    if (updates.need_zones) {
        if (!animal.need_zones) animal.need_zones = {};
        animal.need_zones[mapId] = extractedData.need_zones;
    }

    // Save
    try {
        fs.writeFileSync(ANIMAL_DATA_PATH, JSON.stringify(animalData, null, 2), 'utf-8');
        console.log('\n✅ Änderungen gespeichert in animal-data.json!\n');
    } catch (error) {
        console.log(`\n❌ Fehler beim Speichern: ${error.message}\n`);
        process.exit(1);
    }

    // Show raw OCR text for debugging
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📄 OCR-Rohtext (für Debugging)');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(extractedData.raw_text.substring(0, 1000) + (extractedData.raw_text.length > 1000 ? '...' : ''));
    console.log('\n');
}

main().catch(error => {
    console.error('Unerwarteter Fehler:', error);
    process.exit(1);
});
