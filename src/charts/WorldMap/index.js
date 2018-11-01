import * as d3 from 'd3';
import debounce from 'lodash.debounce';
import * as topojson from 'topojson-client';

class WorldMap {
    constructor(data, countries, container, classPrefix) {
        this.data = data;
        this.countries = countries;
        this.svg = d3.select(container);
        this.classPrefix = classPrefix;

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
            .domain(d3.extent(Object.values(this.countries), d => d.value))
            .range(['#51a7ca', '#50b229', '#f6b42a', '#e77820', 
                    '#d74e24', '#c21729', '#a8002d', '#8b002f']);
    }

    render() {
        const world = topojson.feature(this.data, this.data.objects.world);
        const path = d3.geoPath().projection(this.projection);
        const map = this.svg.append('g');

        map
            .selectAll('.country')
            .data(world.features)
            .enter()
            .append('path')
            .attr('class', d => {
                return this.countries[d.properties.NAME]
                    ? `${this.classPrefix}__country ${this.classPrefix}__country_type_active`
                    : `${this.classPrefix}__country`
            })
            .attr('fill', d => {
                return this.countries[d.properties.NAME]
                    ? this.colorScale(this.countries[d.properties.NAME].value)
                    : '#cccccc';
            })
            .attr('d', path)
            .on('mouseover', this.onMouseOver)
            .on('mouseout', this.onMouseOut);
        
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
            .attr('fill', d => d ? this.colorScale(d) : '#51a7ca')
            .on('mouseover', d => {
                d3.selectAll(`.${this.classPrefix}__circle`)
                    .filter(item => item.type !== 'year' && item.isChampion.size !== d)
                    .transition()
                    .attr('fill', '#cccccc');
            })
            .on('mouseout', d => {
                d3.selectAll(`.${this.classPrefix}__circle`)
                    .transition()
                    .attr('fill', d => this.getColor(d));
            });

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

    onMouseOver = d => {
        if (!this.countries[d.properties.NAME]) {
            return;
        }

        const {pageX, pageY} = d3.event;
        const country = this.countries[d.properties.NAME];
        const tooltip = d3.select(`.${this.classPrefix}__tooltip`);

        d3.selectAll(`.${this.classPrefix}__country_type_active`)
            .filter(item => item.properties.NAME === d.properties.NAME)
            .attr('stroke', '#000000');

        tooltip
            .html(`
                <h3 class="${this.classPrefix}__tooltip-header">${country.title}</h3>
                <p>${country.description}</p>
                <p><a class="${this.classPrefix}__tooltip-link"
                      href="${country.url}"
                      target="_blank">Подробнее</a></p>
            `)	
            .style('left', `${pageX}px`)		
            .style('top', `${pageY}px`)
            .attr('data-name', d.properties.NAME)
            .style('display', 'block')
            .transition()		
            .duration(100)		
            .style('opacity', 1);

        tooltip.on('mouseout', () => {
            this.hideTooltip(d);
        });
    }

    onMouseOut = d => {
        this.hideTooltip(d);
    };

    hideTooltip = d => {
        setTimeout(() => {
            const area = d3.selectAll(`.${this.classPrefix}__country_type_active`)
                           .filter(item => item.properties.NAME === d.properties.NAME);
            const areaNode = area.node();

            const tooltip = d3.select(`.${this.classPrefix}__tooltip[data-name="${d.properties.NAME}"]`);
            const tooltipNode = tooltip.node();

            if (!tooltipNode
                || tooltipNode !== tooltipNode.parentElement.querySelector(':hover')
                && areaNode !== areaNode.parentElement.querySelector(':hover')) {
                area.attr('stroke', 'none');
                tooltip
                    .style('opacity', 0)
                    .style('display', 'none');
            }            
        }, 300);
    };
}

export default WorldMap;
