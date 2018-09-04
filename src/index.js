import * as d3 from 'd3';
import Sankey from './Sankey.js';
import { transformDataForSankey } from './transformFunctions.js'

d3.json('data/race_results.json')
    .then(data => {
        const sankey = new Sankey(transformDataForSankey(data), d3.select('svg#sankey'));

        sankey.render();
    });
