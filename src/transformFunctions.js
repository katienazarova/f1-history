export function transformDataForSankey(data) {
    const nodes = {};
    const links = {};
    const constructors = [];
    const years = new Map();

    data.forEach(item => {
        const grandPrix = years.has(item.year) 
            ? years.get(item.year) 
            : new Set();

        grandPrix.add(item.grand_prix.ru);
        years.set(item.year, grandPrix);

        if (+item.year != 2017 && item.grand_prix.en != 'Azerbaijan Grand Prix') {
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
                years: new Set([item.year]), 
                links: 1 
            }
            constructors.push(item.constructor);
        }

        const itemData = {
            pilot: item.pilot.en,
            constructor: item.constructor,
            place: item.place,
            grand_prix: item.grand_prix.en
        };

        // Constructor
        nodes[item.constructor] = { name: item.constructor };

        let index = `${nospace(item.pilot.en)}_${nospace(item.constructor)}`;

        if (links[index]) {
            links[index].value++;
        } else {
            links[index] = {
                source: item.pilot.en,
                target: item.constructor,
                value: 1,
                ...itemData                
            };
        }

        // Place
        nodes[item.place] = { name: item.place };

        index = `${nospace(item.constructor)}_${nospace(item.place)}`;

        if (links[index]) {
            links[index].value++;
        } else {
            links[index] = {
                source: item.constructor,
                target: item.place,
                value: 1,
                ...itemData                
            };
        }
    });

    return {
        nodes: Object.values(nodes),
        links: Object.values(links),
        years,
        constructors        
    };
}

function nospace(string) {
    return string.replace(/\s/g, '');
}
