import * as d3 from 'd3';
import debounce from 'lodash.debounce';

import colors from './colors';
import { parallelogram } from './customShapes';

class BubbleChart {
    constructor(data, svg) {
        this.data = data;
        this.svg = svg;

        this.params = {
            nodeWidth: 5,
            nodePadding: 10,
            padding: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            transitionDuration: 300
        };

        this.layout();

        /*d3.select(window).on('resize.updatesvg', debounce(() => {
            this.svg.selectAll('*').remove();
            this.width = svg.node().clientWidth;
            this.height = svg.node().clientHeight;

            this.layout();
            this.render();
        }));*/
    }

    layout() {
        this.width = this.svg.node().clientWidth;
        this.height = this.svg.node().clientHeight;
    }

    render() {
        const ticksData = ['1950', '1970', '1990', '2010'].map(year => ({
            name: year,
            racesCount: 250, 
            type: 'year', 
            isChampion: new Set(), 
            years: new Set([year]) 
        }));

        const data = [
            ...ticksData,
            ...this.data
        ];

        const width = (this.width - this.params.padding.left - this.params.padding.right) * 0.7;
        const height = this.height - this.params.padding.top - this.params.padding.bottom;

        const length = Math.sqrt(width * width + height * height);
        const angle = (Math.asin(height / length) * 180) / Math.PI;

        const g = this.svg
            .append('g');

        const x = d3.scaleLinear()
            .domain([1940, 2030])
            .range([0, length]);

        const r = d3.scaleLinear()
            .domain(d3.extent(data, d => d.racesCount))
            .rangeRound([7, 35]);

        const color = d3.scaleLinear()
            .domain(d3.extent(data, d => d.isChampion && d.isChampion.size || 0))
            .interpolate(d3.interpolateHcl)
            .range([d3.rgb("#ec675f"), d3.rgb('#c21729')]);

        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(d1 => x([...d1.years][0])).strength(1))
            .force('y', d3.forceY(height / 2))
            .force('collide', d3.forceCollide(d => r(d.racesCount) - 2))
            .stop();

        const ticks = data
            .filter(d => d.type === 'year')
            .map(d => Object.assign(d, {
                fx: x([...d.years][0]),
                fy: height / 2,
            }));

        for (var i = 0; i < 500; ++i) {
            simulation.tick();
        }

        g.append('g')
            .attr('class', 'axis axis_type_x')
            .attr('transform', `translate(0,${height / 2})`)
            .call(d3.axisBottom(x).ticks(0).tickSize(0));

        const cell = g.append('g')
            .attr('class', 'cells')
            .selectAll('g')
            .data(
                d3.voronoi()
                .extent([
                    [-this.params.padding.left, -this.params.padding.top],
                    [this.width + this.params.padding.right, this.height + this.params.padding.top]
                ])
                .x(d => d.x)
                .y(d => d.y)
                .polygons(data)
            )
            .enter()
            .append('g');

        cell.append('circle')
            .attr('r', d => {
                return r(d.data.racesCount) - 2;
            })
            .attr('fill', d => this.getColor(d, color))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('cx', d => d.data.x)
            .attr('cy', d => d.data.y);

        cell.append('title')
            .text(function(d) { return d.data.name + " - " + (d.data.racesCount); });

            console.log(ticks);
        g.selectAll('text.year-tick')
            .data(ticks)
            .enter()
            .append('text')
            .attr('class', 'year-tick')
            .attr('text-anchor', 'middle')
            .attr('x', d => d.fx)
            .attr('y', d => d.fy)
            .attr('transform-origin', d => `${d.fx}px ${d.fy}px`)
            .attr('transform', `rotate(${Math.round(angle)}) translate(0,5)`)
            .text(d => d.name);

        g.attr('transform-origin', `${this.width - width}px ${height / 2}px`)
            .attr('transform', `translate(${this.width - length},${this.params.padding.top}) rotate(-${Math.round(angle)})`);
    }

    getColor(d, color) {
        if (d.data.type === 'year') {
            return '#ffffff';
        }

        return d.data.isChampion.size 
            ? color(d.data.isChampion.size)
            : '#51a7ca';
    }
}

function type(d) {
    if (!d.value) return;
    d.value = +d.value;
    return d;
}

export default BubbleChart;