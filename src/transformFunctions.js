export function transformDataForSankey(data, filter) {
    const nodes = {};
    const links = {};
    const constructors = new Set();
    const years = new Map();

    data.forEach(item => {
        const grandPrix = years.has(item.year) 
            ? years.get(item.year) 
            : new Set();

        grandPrix.add(item.grand_prix.ru);
        years.set(item.year, grandPrix);

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

    return {
        nodes: Object.values(nodes),
        links: Object.values(links),
        constructors: [...constructors],
        years                
    };
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
