const data = require('../build-config/animal-data.json');
let complete = 0;
let incomplete = [];

Object.entries(data).forEach(([key, val]) => {
    if (val?.name_de) {
        const hasZones = val.need_zones?.drink?.length || val.need_zones?.feed?.length || val.need_zones?.rest?.length;
        const hasScores = val.diamond && val.gold && val.silver;
        const hasFur = val.fur_common?.length || val.fur_rare?.length;
        const hasWeight = val.max_weight_kg;

        if (hasZones && hasScores && hasFur && hasWeight) {
            complete++;
        } else {
            const missing = [];
            if (!hasZones) missing.push('need_zones');
            if (!hasScores) missing.push('scores');
            if (!hasFur) missing.push('fur');
            if (!hasWeight) missing.push('weight');
            incomplete.push({ name: val.name_de, missing: missing.join(', ') });
        }
    }
});

console.log('=== VOLLSTÄNDIGE TIERE: ' + complete + ' ===');
console.log('');
console.log('=== UNVOLLSTÄNDIGE TIERE: ' + incomplete.length + ' ===');
incomplete.forEach(a => console.log('  - ' + a.name + ': fehlt ' + a.missing));
