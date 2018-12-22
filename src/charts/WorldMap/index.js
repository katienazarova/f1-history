import * as d3 from 'd3';
import debounce from 'lodash.debounce';
import * as topojson from 'topojson-client';

import withTooltip from '../../decorators/withTooltip';

@withTooltip(
    '.country',
    item => item.country,
    500
)
class WorldMap {
    constructor(data, countries, container, classPrefix) {
        this.svg = d3.select(container);
        this.classPrefix = classPrefix;

        this.data = topojson
            .feature(data, data.objects.world)
            .features
            .map(item => {
                const country = countries[item.properties.NAME] || {};

                return {
                    ...item,
                    ...country,
                    description: country.title 
                        ? `<h3 class="tooltip__header">${country.title}</h3>
                            <p>${country.description || ''}</p>
                            <p><a class="tooltip__link"
                                    href="${country.url}"
                                    target="_blank">Подробнее</a></p>`
                        : null,
                    value: country.years && country.years.length ? country.years.length : 0,
                };
            });

        this.layout();

        window.addEventListener('resize', debounce(() => {
            this.svg.selectAll('*').remove();

            this.layout();
            this.render();
        }, 300));
    }

    layout() {
        const DEFAULT_WIDTH = 1200;
        const DEFAULT_HEIGHT = 500;
        const DEFAULT_SCALE = 190;
        const DEFAULT_OFFSET = 20;

        this.width = this.svg.node().clientWidth;
        this.height = (this.width * DEFAULT_HEIGHT) / DEFAULT_WIDTH;

        const scale = (DEFAULT_SCALE * this.width) / DEFAULT_WIDTH;
        const offset = (DEFAULT_OFFSET * this.width) / DEFAULT_WIDTH;

        this.svg.attr('height', this.height);
        this.projection = d3.geoEquirectangular()
            .scale(scale)
            .translate([this.width / 2, this.height / 2 + offset]);

        this.colorScale = d3.scaleQuantize()
            .domain(d3.extent(this.data, d => d.value))
            .range(['#51a7ca', '#50b229', '#f6b42a', '#e77820', 
                    '#d74e24', '#c21729', '#a8002d', '#8b002f']);
    }

    render() {
        const path = d3.geoPath().projection(this.projection);
        const map = this.svg.append('g');

        map
            .selectAll(`.${this.classPrefix}__country`)
            .data(this.data)
            .enter()
            .append('path')
            .attr('class', d => {
                return d.value
                    ? `${this.classPrefix}__country country`
                    : `${this.classPrefix}__country`
            })
            .attr('fill', d => d.value ? this.colorScale(d.value) : '#cccccc')
            .attr('stroke', '#ffffff')
            .attr('d', path);

        d3.select('body')
            .append('div')	
            .attr('class', `${this.classPrefix}__tooltip`)				
            .style('opacity', 0)
            .style('display', 'none');

        this.renderLegend();
    }

    renderLegend = () => {
        const data = [1, 10, 20, 30, 40, 50, 60, 70];
        const container = this.svg
            .append('g')
            .attr('class', `${this.classPrefix}__legend`);

        let x = this.width - 280,
            y = this.height - 35;

        container
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d, i) => x + 35 * i)
            .attr('y', y + 7)
            .attr('width', 30)
            .attr('height', 10)
            .attr('fill', d => d ? this.colorScale(d) : '#51a7ca');

        container
            .selectAll(`text.${this.classPrefix}__color-label`)
            .data(data)
            .enter()
            .append('text')
            .attr('class', `${this.classPrefix}__color-label`)
            .attr('text-anchor', 'middle')
            .attr('x', (d, i) => x + 15 + 35 * i)
            .attr('y', y + 30)
            .text(d => d);

        container
            .append('text')
            .attr('class', `${this.classPrefix}__legend-caption`)
            .attr('x', x)
            .attr('y', y)
            .text('Цвет зависит от количества проведённых гран-при');
    };
}

export default WorldMap;
