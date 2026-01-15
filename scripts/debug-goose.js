const data = require('../build-config/animal-data.json');

console.log('canada_goose unter animals:', !!data.animals?.canada_goose);

if (data.animals?.canada_goose) {
    const g = data.animals.canada_goose;
    console.log('class:', g.class);
    console.log('max_score:', g.max_score);
    console.log('diamond:', g.diamond);
    console.log('fur_common:', g.fur_common);
}
