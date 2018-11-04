export function transformCoordinates(angle, center, translateX, translateY) {
    return function (point) {
        const x1 = point.x - center.x;
        const y1 = point.y - center.y;

        const x = x1 * Math.cos(angle) - y1 * Math.sin(angle) + translateX + center.x;
        const y = x1 * Math.sin(angle) + y1 * Math.cos(angle) + translateY + center.y;

        return { x, y };
    }
}

export function transformData(data, championsData, grandPrixData, filter = {}) {
    const nodes = {};
    const links = {};
    const constructors = new Set();
    const years = new Map();
    const pilots = {};

    const countriesByGrandPrix = grandPrixData.reduce((result, item) => {
        item.years = new Set();
        result[item.name] = item;

        return result;
    }, {});

    data.forEach((item, i) => {
        const grandPrix = years.has(item.year) 
            ? years.get(item.year) 
            : new Set();

        grandPrix.add(item.grand_prix.ru);
        years.set(item.year, grandPrix);

        if (countriesByGrandPrix[item.grand_prix.en]) {
            countriesByGrandPrix[item.grand_prix.en].years.add(item.year);
            countriesByGrandPrix[item.grand_prix.en].title = item.grand_prix.ru;
        }

        if (pilots[item.pilot.en]) {
            pilots[item.pilot.en].racesCount++;
            pilots[item.pilot.en].years.add(item.year);

            if (item.pilot.en === championsData[item.year]) {
                pilots[item.pilot.en].isChampion.add(item.year);
            }
        } else {
            pilots[item.pilot.en] = {
                name: item.pilot.en,
                name_ru: item.pilot.ru,
                country: item.pilot_country,
                url: item.pilot_url,
                racesCount: 1,
                years: new Set([item.year]),
                isChampion: (item.pilot.en === championsData[item.year]) ? new Set([item.year]) : new Set()
            };
        }

        if (item.year != filter.year || item.grand_prix.ru != filter.grandPrix) {
            return;
        }

        if (nodes[item.pilot.en]) {
            nodes[item.pilot.en].years.add(item.year);
            nodes[item.pilot.en].links++;
        } else {
            nodes[item.pilot.en] = { 
                name: item.pilot.en,
                title: item.pilot.ru,
                pilot: item.pilot, 
                pilot_country: item.pilot_country,
                constructor: item.constructor,
                place: item.place,
                years: new Set([item.year]),
                type: 'pilot'
            }
            constructors.add(item.constructor);
        }

        // Constructor
        nodes[item.constructor] = { name: item.constructor, type: 'constructor' };
        addLink(links, item, item.pilot.en, item.constructor);

        // Place
        nodes[item.place] = { name: item.place, type: 'place' };
        addLink(links, item, item.constructor, item.place);
    });

    Object.values(pilots)
        .forEach(item => {
            item.description = `<h3 class="tooltip__header">${item.name_ru}</h3>
                <p>Принял участие в ${item.racesCount} Гран-при Формулы-1 ${formatYears(item.years)}.</p>
                ${ item.isChampion.size ? `<p>Завоевал чемпионский титул 
                в ${[...item.isChampion].join(', ')} ${item.isChampion.size === 1 ? 'году' : 'годах'}.<p>` : '' }
                <p><a class="tooltip__link" href="${item.url}" target="_blank">Подробнее</a></p>`;
        });

    const countries = Object.values(countriesByGrandPrix)
        .reduce((result, item) => {
            if (result[item.country]) {
                result[item.country].years = new Set([...result[item.country].years, ...item.years]);
            } else {
                result[item.country] = item;
            }

            result[item.country].value = result[item.country].years.size;

            return result;
        }, {});

    return {
        nodes: Object.values(nodes),
        links: Object.values(links),
        pilots: Object.values(pilots),
        constructors: [...constructors],
        years,
        countries
    };
}

export function formatYears(years) {
    const ranges = [];

    if (years.size === 1) {
        return `в ${[...years][0]} году`;
    }

    let range,
        prev;

    for (let year of years) {
        if (year - prev === 1) {
            range.push(year);
        } else {
            if (range && range.length) { 
                ranges.push(range);
            }
            range = [year];
        }

        prev = year;
    }

    if (range && range.length) { 
        ranges.push(range);
    }

    if (ranges.length === 1) {
        return `с ${ranges[0][0]} по ${ranges[0][ranges[0].length - 1]} годы`;
    }

    return `в ${ranges.map(range => range.length === 1 
        ? range[0] 
        : `${range[0]}–${range[range.length - 1]}`).join(', ')} гг`;
}

export function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

function addLink(links, item, source, target) {
    let index = `${removeSpaces(source)}_${removeSpaces(target)}`;

    if (links[index]) {
        links[index].value++;
        links[index].pilots.add(item.pilot.en);
    } else {
        links[index] = {
            source,
            target,
            value: 1,
            pilots: new Set([item.pilot.en]),
            constructor: item.constructor,
            place: item.place,
            grand_prix: item.grand_prix.en,
            year: item.year                
        };
    }
}
function removeSpaces(string) {
    return string.replace(/\s/g, '');
}
