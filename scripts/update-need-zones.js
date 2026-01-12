// Update need zones from tiltaaa data (Dec 2022 / July 2022)
const fs = require('fs');

const dataPath = './build-config/animal-data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Helper: parse time range "HH:MM - HH:MM" to {start, end}
const parseRange = (str) => {
    const match = str.match(/(\d+):?(\d*)\s*-\s*(\d+):?(\d*)/);
    if (!match) return null;
    const start = parseInt(match[1]) + (match[2] ? parseInt(match[2]) / 60 : 0);
    let end = parseInt(match[3]) + (match[4] ? parseInt(match[4]) / 60 : 0);
    if (end === 0) end = 24;
    return { start: Math.round(start * 2) / 2, end: Math.round(end * 2) / 2 };
};

// tiltaaa Need Zones by Map
const tiltaaaData = {
    layton: {
        black_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        blacktail: { feed: [[4, 8], [12, 16]], drink: [[16, 20]], rest: [[0, 4], [8, 12], [20, 24]] },
        coyote: { feed: [[4, 7], [17, 20], [20, 24]], drink: [[0, 4]], rest: [[7, 10], [10, 14], [14, 17]] },
        turkey: { feed: [[4, 8], [8, 11], [14, 17], [17, 20]], drink: [], rest: [[0, 4], [11, 14], [20, 24]] },
        moose: { feed: [[4, 8], [16, 20]], drink: [[12, 16]], rest: [[0, 4], [8, 12], [20, 24]] },
        roosevelt_elk: { feed: [[8, 12], [16, 20]], drink: [[4, 8.5]], rest: [[12, 16], [20, 24], [0, 4]] },
        whitetail: { feed: [[4, 8], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [12, 16], [20, 24]] },
        jackrabbit: { feed: [[0, 3], [3, 6], [18, 21], [21, 24]], drink: [], rest: [[6, 10], [10, 14], [14, 18]] }
    },
    hirschfelden: {
        european_bison: { feed: [[4, 7], [7, 10], [17, 20]], drink: [[10, 14]], rest: [[0, 4], [14, 17], [20, 24]] },
        fallow_deer: { feed: [[6, 10], [17, 21]], drink: [[10, 13]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] },
        red_deer: { feed: [[13, 17], [17, 21]], drink: [[6, 10]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
        red_fox: { feed: [[0, 4], [4, 7], [20, 24]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] },
        ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        roe_deer: { feed: [[4, 7], [7, 10], [17, 20]], drink: [[14, 17]], rest: [[0, 4], [10, 14], [20, 24]] },
        wild_boar: { feed: [[3, 6], [17, 21], [21, 24]], drink: [[0, 3]], rest: [[6, 10], [10, 14], [14, 17]] },
        canada_goose: { feed: [[6, 10], [16, 19]], drink: [[10, 16]], rest: [[0, 6], [19, 24]] },
        european_rabbit: { feed: [[5, 9], [9, 12], [12, 16], [16, 18]], drink: [[18, 22]], rest: [[22, 24], [0, 5]] }
    },
    medved: {
        brown_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        eurasian_lynx: { feed: [[0, 3], [20, 24]], drink: [[3, 6]], rest: [[9, 12], [12, 16], [16, 20]] },
        gray_wolf: { feed: [], drink: [[17, 20]], rest: [] },
        moose: { feed: [[4, 8], [16, 20]], drink: [[12, 16]], rest: [[0, 4], [8, 12], [20, 24]] },
        reindeer: { feed: [[8, 12.5], [16, 20]], drink: [[4, 8]], rest: [[0, 4], [12, 16], [20, 24]] },
        musk_deer: { feed: [[12, 16], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [4, 8], [20, 24]] },
        western_capercaillie: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        wild_boar: { feed: [[3, 6], [17, 21], [21, 24]], drink: [[0, 3]], rest: [[6, 10], [10, 14], [14, 17]] }
    },
    vurhonga: {
        blue_wildebeest: { feed: [[3, 6], [9, 12], [15, 18]], drink: [[6, 9]], rest: [[0, 3], [12, 15], [18, 21], [21, 24]] },
        cape_buffalo: { feed: [[6, 9], [12, 15], [15, 18]], drink: [[9, 12]], rest: [[0, 3], [3, 6], [18, 21], [21, 24]] },
        gemsbok: { feed: [[0, 3], [6, 10], [20, 24]], drink: [[3, 6]], rest: [[10, 13], [13, 16], [16, 20]] },
        lesser_kudu: { feed: [[0, 3], [3, 7], [21, 24]], drink: [[18, 21]], rest: [[7, 10], [10, 14], [14, 18]] },
        lion: { feed: [[0, 4], [4, 8]], drink: [[12, 15]], rest: [[8, 12], [15, 18], [18, 21], [21, 24]] },
        scrub_hare: { feed: [[0, 3], [3, 6], [18, 21], [21, 24]], drink: [], rest: [[6, 10], [10, 14], [14, 18]] },
        side_striped_jackal: { feed: [[0, 3], [3, 6], [18, 21], [21, 24]], drink: [], rest: [[6, 10], [10, 14], [14, 18]] },
        springbok: { feed: [[4, 8], [8, 11], [11, 14], [18, 21], [21, 24]], drink: [], rest: [[0, 4], [14, 18]] },
        warthog: { feed: [[6, 9], [9, 12], [12, 15]], drink: [[15, 18]], rest: [[0, 3], [3, 6], [18, 21], [21, 24]] }
    },
    parque: {
        axis_deer: { feed: [[6, 9], [9, 12], [21, 24]], drink: [[3, 6]], rest: [[0, 3], [12, 15], [15, 18], [18, 21]] },
        blackbuck: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[18, 21]], rest: [[0, 3], [3, 6], [12, 15], [21, 24]] },
        mule_deer: { feed: [[0, 3], [3, 6], [21, 24]], drink: [[15, 18]], rest: [[6, 9], [9, 12], [12, 15], [18, 21]] },
        puma: { feed: [[0, 3], [3, 6], [15, 18]], drink: [[21, 24]], rest: [[6, 9], [9, 12], [12, 15], [18, 21]] },
        red_deer: { feed: [[13, 17], [17, 21]], drink: [[6, 10]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
        water_buffalo: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[12, 15]], rest: [[0, 3], [3, 6], [18, 21], [21, 24]] },
        wild_boar: { feed: [[3, 6], [17, 21], [21, 24]], drink: [[0, 3]], rest: [[6, 10], [10, 14], [14, 17]] }
    },
    yukon: {
        caribou: { feed: [[8, 12], [16, 20]], drink: [[4, 8]], rest: [[0, 4], [12, 16], [20, 24]] },
        gray_wolf: { feed: [[3, 6], [18, 21], [21, 24]], drink: [[0, 3]], rest: [[6, 9], [9, 12], [12, 15], [15, 18]] },
        grizzly_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        moose: { feed: [[4, 8], [16, 20]], drink: [[12, 16]], rest: [[0, 4], [8, 12], [20, 24]] },
        plains_bison: { feed: [[4, 8], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [12, 16], [20, 24]] },
        red_fox: { feed: [[0, 4], [4, 7], [20, 24]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] }
    },
    cuatro: {
        european_rabbit: { feed: [[0, 3], [3, 6], [18, 21], [21, 24]], drink: [], rest: [[6, 9], [9, 12], [12, 15], [15, 18]] },
        iberian_mouflon: { feed: [[0, 3], [15, 18], [21, 24]], drink: [[18, 21]], rest: [[3, 6], [6, 9], [9, 12], [12, 15]] },
        iberian_wolf: { feed: [[0, 3], [18, 21], [21, 24]], drink: [[3, 6]], rest: [[6, 9], [9, 12], [12, 15], [15, 18]] },
        red_deer: { feed: [[13, 17], [17, 21]], drink: [[6, 10]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
        ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        roe_deer: { feed: [[4, 7], [7, 10], [17, 20]], drink: [[14, 17]], rest: [[0, 4], [10, 14], [20, 24]] },
        wild_boar: { feed: [[3, 6], [17, 21], [21, 24]], drink: [[0, 3]], rest: [[6, 10], [10, 14], [14, 17]] },
        beceite_ibex: { feed: [[0, 4], [17, 21]], drink: [[10, 14]], rest: [[4, 7], [7, 10], [14, 17], [21, 24]] },
        ronda_ibex: { feed: [[0, 4], [17, 21]], drink: [[10, 14]], rest: [[4, 7], [7, 10], [14, 17], [21, 24]] }
    },
    silver_ridge: {
        black_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        bighorn_sheep: { feed: [[3, 6], [6, 9], [9, 12], [16, 20]], drink: [[12, 16]], rest: [[0, 3], [20, 24]] },
        turkey: { feed: [[4, 8], [8, 11], [14, 17], [17, 20]], drink: [], rest: [[0, 4], [11, 14], [20, 24]] },
        mountain_goat: { feed: [[4, 7], [7, 10], [10, 13], [17, 20]], drink: [], rest: [[0, 4], [13, 17], [20, 24]] },
        mountain_lion: { feed: [[21, 24], [3, 6], [15, 18]], drink: [[0, 3]], rest: [[6, 9], [9, 12], [12, 15], [18, 21]] },
        mule_deer: { feed: [[0, 3], [3, 6], [21, 24]], drink: [[15, 18]], rest: [[6, 9], [9, 12], [12, 15], [18, 21]] },
        plains_bison: { feed: [[4, 8], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [12, 16], [20, 24]] },
        pronghorn: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[18, 21]], rest: [[12, 15], [21, 24], [0, 3], [3, 6]] },
        rocky_mountain_elk: { feed: [[8, 12], [16, 20]], drink: [[4, 8]], rest: [[12, 16], [20, 24], [0, 4]] }
    },
    te_awaroa: {
        chamois: { feed: [[4, 8], [8, 12], [20, 24]], drink: [], rest: [[0, 4], [12, 16], [16, 20]] },
        fallow_deer: { feed: [[6, 10], [17, 21]], drink: [[10, 13]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] },
        feral_goat: { feed: [[6, 9], [9, 12], [18, 21]], drink: [[15, 18]], rest: [[0, 3], [3, 6], [12, 15], [21, 24]] },
        feral_pig: { feed: [[6, 10], [14, 17], [17, 20]], drink: [[3, 6]], rest: [[0, 3], [10, 14], [20, 24]] },
        turkey: { feed: [[4, 8], [8, 11], [14, 17], [17, 20]], drink: [], rest: [[0, 4], [11, 14], [20, 24]] },
        red_deer: { feed: [[13, 17], [17, 21]], drink: [[6, 10]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
        sika_deer: { feed: [[6, 10], [17, 21]], drink: [[10, 13]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] }
    },
    rancho: {
        antelope_jackrabbit: { feed: [[0, 4], [4, 7], [17, 20], [20, 24]], drink: [], rest: [[7, 11], [11, 14], [14, 17]] },
        bighorn_sheep: { feed: [[4, 7], [7, 11], [14, 18], [18, 21]], drink: [[11, 14]], rest: [[0, 4], [21, 24]] },
        collared_peccary: { feed: [[7, 11], [20, 24]], drink: [[0, 3]], rest: [[3, 7], [11, 14], [14, 17]] },
        coyote: { feed: [[0, 4], [4, 7], [17, 21]], drink: [[21, 24]], rest: [[7, 11], [11, 14], [14, 17]] },
        mexican_bobcat: { feed: [[20, 24], [0, 4], [4, 7]], drink: [[17, 20]], rest: [[7, 11], [11, 14], [14, 17]] },
        mule_deer: { feed: [[0, 4], [4, 7], [20, 24]], drink: [[14, 17]], rest: [[7, 11], [11, 14], [17, 20]] },
        pronghorn: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[18, 21]], rest: [[12, 15], [21, 24], [0, 3], [3, 6]] },
        ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        rio_grande_turkey: { feed: [[4, 7], [7, 11], [14, 17], [17, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        whitetail: { feed: [[4, 8], [14, 18], [18, 21]], drink: [[8, 11]], rest: [[0, 4], [11, 14], [21, 24]] }
    },
    mississippi: {
        american_alligator: { feed: [[0, 3], [3, 6], [6, 9], [20, 24]], drink: [], rest: [[9, 12], [12, 16], [16, 20]] },
        black_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        bobwhite_quail: { feed: [[4, 7], [7, 10], [13, 16], [16, 20]], drink: [], rest: [[0, 4], [10, 13], [20, 24]] },
        raccoon: { feed: [[3, 6], [10, 13], [20, 24]], drink: [[0, 3]], rest: [[6, 10], [13, 16], [16, 20]] },
        eastern_cottontail: { feed: [[4, 7], [7, 10], [10, 13], [17, 21]], drink: [], rest: [[13, 17], [21, 24], [0, 4]] },
        eastern_wild_turkey: { feed: [[4, 8], [8, 11], [17, 20]], drink: [], rest: [[0, 4], [11, 14], [14, 17], [20, 24]] },
        gray_fox: { feed: [[20, 24], [0, 4], [4, 7]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] },
        whitetail: { feed: [[4, 8], [14, 18], [18, 21]], drink: [[8, 11]], rest: [[0, 4], [11, 14], [21, 24]] },
        wild_hog: { feed: [[6, 10], [14, 17], [17, 20]], drink: [[3, 6]], rest: [[0, 3], [10, 14], [20, 24]] }
    },
    revontuli: {
        black_grouse: { feed: [[4, 8], [8, 11], [14, 18]], drink: [], rest: [[0, 4], [11, 14], [18, 21], [21, 24]] },
        brown_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        eurasian_lynx: { feed: [[0, 3], [6, 9], [20, 24]], drink: [[3, 6]], rest: [[9, 12], [12, 16], [16, 20]] },
        hazel_grouse: { feed: [[4, 8], [8, 11], [14, 18]], drink: [], rest: [[0, 4], [11, 14], [18, 21], [21, 24]] },
        moose: { feed: [[4, 8], [16, 20]], drink: [[12, 16]], rest: [[0, 4], [8, 12], [20, 24]] },
        mountain_hare: { feed: [[4, 7], [7, 10], [10, 13], [13, 17], [17, 21]], drink: [], rest: [[0, 4], [21, 24]] },
        raccoon_dog: { feed: [[3, 6], [10, 13], [20, 24]], drink: [[0, 3]], rest: [[6, 10], [13, 16], [16, 20]] },
        rock_ptarmigan: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        western_capercaillie: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        whitetail: { feed: [[4, 8], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [12, 16], [20, 24]] },
        willow_ptarmigan: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] }
    },
    new_england: {
        black_bear: { feed: [[0, 4], [4, 8]], drink: [[20, 24]], rest: [[8, 12], [12, 16], [16, 20]] },
        bobcat: { feed: [[0, 3], [6, 9], [20, 24]], drink: [[3, 6]], rest: [[9, 12], [12, 16], [16, 20]] },
        bobwhite_quail: { feed: [[4, 7], [7, 10], [13, 16], [16, 20]], drink: [], rest: [[0, 4], [10, 13], [20, 24]] },
        raccoon: { feed: [[0, 3], [10, 13], [20, 24]], drink: [[3, 6]], rest: [[6, 10], [13, 16], [16, 20]] },
        coyote: { feed: [[0, 4], [4, 7], [17, 21], [21, 24]], drink: [[0, 3]], rest: [[7, 11], [11, 14], [14, 17]] },
        eastern_cottontail: { feed: [[4, 7], [7, 10], [10, 13], [17, 21]], drink: [], rest: [[13, 17], [21, 24], [0, 4]] },
        eastern_wild_turkey: { feed: [[4, 8], [8, 11], [17, 20]], drink: [], rest: [[0, 4], [11, 14], [14, 17], [20, 24]] },
        gray_fox: { feed: [[20, 24], [0, 4], [4, 7]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] },
        moose: { feed: [[4, 8], [16, 20]], drink: [[12, 16]], rest: [[0, 4], [8, 12], [20, 24]] },
        red_fox: { feed: [[0, 4], [4, 7], [20, 24]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] },
        ring_necked_pheasant: { feed: [[4, 8], [8, 11], [14, 18], [18, 21]], drink: [], rest: [[0, 4], [11, 14], [21, 24]] },
        whitetail: { feed: [[4, 8], [16, 20]], drink: [[8, 12]], rest: [[0, 4], [12, 16], [20, 24]] }
    },
    emerald: {
        axis_deer: { feed: [[6, 9], [9, 12], [21, 24]], drink: [[3, 6]], rest: [[0, 3], [12, 15], [15, 18], [18, 21]] },
        banteng: { feed: [[4, 7], [7, 10], [14, 17]], drink: [[17, 20]], rest: [[0, 4], [10, 14], [20, 24]] },
        fallow_deer: { feed: [[6, 10], [17, 21]], drink: [[10, 13]], rest: [[0, 3], [3, 6], [13, 17], [21, 24]] },
        feral_goat: { feed: [[6, 9], [9, 12]], drink: [[12, 15]], rest: [[15, 18]] },
        feral_pig: { feed: [[6, 10], [14, 17], [17, 20]], drink: [[0, 3]], rest: [[3, 6], [10, 14], [20, 24]] },
        hog_deer: { feed: [[4, 7], [17, 21]], drink: [[13, 17]], rest: [[0, 4], [7, 10], [10, 13], [21, 24]] },
        javan_rusa: { feed: [[6, 9], [17, 20]], drink: [[20, 24]], rest: [[3, 6], [9, 13], [13, 17]] },
        red_deer: { feed: [[13, 17], [17, 21]], drink: [[6, 10]], rest: [[0, 3], [3, 6], [10, 13], [21, 24]] },
        red_fox: { feed: [[0, 4], [4, 7], [20, 24]], drink: [[17, 20]], rest: [[7, 10], [10, 13], [13, 17]] },
        sambar_deer: { feed: [[0, 3], [6, 9], [20, 24]], drink: [[17, 20]], rest: [[3, 6], [9, 13], [13, 17]] }
    },
    sundarpatan: {
        bengal_tiger: { feed: [[7, 10]], drink: [[4, 7]], rest: [[10, 14]] },
        blackbuck: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[18, 21]], rest: [[0, 3], [3, 6], [12, 15], [21, 24]] },
        blue_sheep: { feed: [[4, 7], [7, 11]], drink: [[14, 17]], rest: [[11, 14]] },
        nilgai: { feed: [[16, 20]], drink: [[8, 12]], rest: [[12, 16]] },
        indian_muntjac: { feed: [[3, 6], [6, 9]], drink: [[15, 18]], rest: [[12, 15]] },
        himalayan_tahr: { feed: [[4, 7], [7, 11]], drink: [], rest: [[11, 14]] },
        water_buffalo: { feed: [[6, 9], [9, 12], [15, 18]], drink: [[12, 15]], rest: [[0, 3], [3, 6], [18, 21], [21, 24]] }
    }
};

// Convert ranges to need_zones format
const toZones = (ranges) => ranges.map(([s, e]) => ({ start: s, end: e }));

// Update animals
Object.entries(tiltaaaData).forEach(([mapId, animals]) => {
    Object.entries(animals).forEach(([animalId, zones]) => {
        if (data.animals[animalId]) {
            if (!data.animals[animalId].need_zones) data.animals[animalId].need_zones = {};
            data.animals[animalId].need_zones[mapId] = {
                drink: toZones(zones.drink || []),
                feed: toZones(zones.feed || []),
                rest: toZones(zones.rest || [])
            };
        }
    });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated need zones from tiltaaa data');
