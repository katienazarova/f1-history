import * as d3 from 'd3';

class WorldMap {
    constructor(data, container, classPrefix) {
        this.data = data;
        this.svg = d3.select(container);
        this.classPrefix = classPrefix;
    }

    render() {
        const world = topojson.feature(this.data, this.data.objects.world);

        const projection = d3.geoEquirectangular()
            //.scale(130)
            .translate([1000 / 2, 500 / 2])
            .precision(.1);

        const path = d3.geoPath().projection(projection);

        const map = d3.select('svg#map')
            .append('g');

        map.selectAll('.country')
            .data(world.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path);
    }    
}
