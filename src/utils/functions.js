export function transformCoordinates(angle, center, translateX, translateY) {
    return function(point) {
        const x1 = point.x - center.x;
        const y1 = point.y - center.y;

        const x = x1 * Math.cos(angle) - y1 * Math.sin(angle) + translateX + center.x;
        const y = x1 * Math.sin(angle) + y1 * Math.cos(angle) + translateY + center.y;

        return { x, y };
    }
}

export function transformData(data, filter = {}) {
    const nodes = {};
    const links = {};
    const grandPrix = {};
    const constructors = new Set();

    data.forEach(item => {
        const currentYearsGrandPrix = grandPrix[item.year] || new Set();

        currentYearsGrandPrix.add(item.grand_prix);
        grandPrix[item.year] = currentYearsGrandPrix;

        if (item.year != filter.year || item.grand_prix != filter.grandPrix) {
            return;
        }

        nodes[item.pilot] = { 
            name: item.pilot,
            type: 'pilot',
            constructor: item.constructor,
            place: item.place,
        }
        constructors.add(item.constructor);

        // Constructor
        nodes[item.constructor] = {
            name: item.constructor,
            type: 'constructor',
            pilot: item.pilot,
            place: item.place,
        };
        addLink(links, item, item.pilot, item.constructor);

        // Place
        if (nodes[item.place]) {
            nodes[item.place].pilots.push(item.pilot);
            nodes[item.place].constructors.push(item.constructor);
        } else {
            nodes[item.place] = {
                name: item.place,
                type: 'place',
                pilots: [item.pilot],
                constructors: [item.constructor],
            };
        }
        addLink(links, item, item.constructor, item.place);
    });

    return {
        nodes: Object.values(nodes),
        links: Object.values(links),
        constructors: [...constructors],
        years: Object.keys(grandPrix),
        grandPrix,
    };
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
    const index = `${removeSpaces(source)}_${removeSpaces(target)}`;

    if (links[index]) {
        links[index].value++;
        links[index].pilots.add(item.pilot);
    } else {
        links[index] = {
            source,
            target,
            value: 1,
            pilots: new Set([item.pilot]),
            constructor: item.constructor,
            place: item.place,
            grand_prix: item.grand_prix,
            year: item.year
        };
    }
}

function removeSpaces(str) {
    return str.replace(/\s/g, '');
}
