/**
 * Validate animal-data.json for completeness and correctness
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let issues = [];
let count = 0;
let withZones = 0;
let withImages = 0;

for (const [id, animal] of Object.entries(data.animals)) {
    if (typeof animal !== 'object' || !animal.name_de) continue;
    count++;

    // Check required fields
    if (!animal.class) issues.push(`${id}: missing class`);
    if (!animal.diamond) issues.push(`${id}: missing diamond`);
    if (!animal.image) issues.push(`${id}: missing image`);

    if (animal.need_zones && animal.need_zones._default) {
        withZones++;
    } else {
        issues.push(`${id}: missing _default zones`);
    }

    if (animal.image) withImages++;
}

console.log('=== Animal Data Validation ===\n');
console.log(`Total animals: ${count}`);
console.log(`Animals with _default zones: ${withZones}`);
console.log(`Animals with images: ${withImages}`);
console.log(`\nIssues found: ${issues.length}`);

if (issues.length > 0 && issues.length < 30) {
    console.log('\nIssues:');
    issues.forEach(i => console.log(`  ⚠️  ${i}`));
} else if (issues.length >= 30) {
    console.log('\n(Too many issues to display - showing first 20)');
    issues.slice(0, 20).forEach(i => console.log(`  ⚠️  ${i}`));
}

console.log('\n✅ Validation complete');
