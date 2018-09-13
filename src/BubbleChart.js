import * as d3 from 'd3';
import debounce from 'lodash.debounce';

import colors from './colors';
import { parallelogram } from './customShapes';

class BubbleChart {
    constructor(data, svg) {
        const ticksData = ['1950', '1970', '1990', '2010'].map(year => ({
            name: year,
            racesCount: 250, 
            type: 'year', 
            isChampion: new Set(), 
            years: new Set([year]) 
        }));

        this.data = [
            ...ticksData,
            ...data
        ];

        this.svg = svg;

        this.params = {
            nodeWidth: 5,
            nodePadding: 10,
            padding: {
                top: 40,
                right: 40,
                bottom: 60,
                left: 0
            },
            transitionDuration: 300
        };

        this.layout();

        d3.select(window).on('resize.updatesvg', debounce(() => {
            this.svg.selectAll('*').remove();

            this.layout();
            this.render();
        }));
    }

    layout() {
        this.outerWidth = this.svg.node().clientWidth;
        this.outerHeight = this.svg.node().clientHeight;

        this.width = (this.outerWidth - this.params.padding.left - this.params.padding.right) * 0.7;
        this.height = this.outerHeight - this.params.padding.top - this.params.padding.bottom;

        this.length = Math.sqrt(this.width * this.width + this.height * this.height);
        this.angleRad = Math.asin(this.height / this.length);
        this.angle = (this.angleRad * 180) / Math.PI;

        this.colorScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.isChampion && d.isChampion.size || 0))
            .interpolate(d3.interpolateHcl)
            .range([d3.rgb("#ec675f"), d3.rgb('#c21729')]);

        this.radiusScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.racesCount))
            .rangeRound([7, 35]);

        this.xScale = d3.scaleLinear()
            .domain([1940, 2030])
            .range([0, this.length]);
    }

    render() {
        this.chartContainer = this.svg
            .append('g')
            .attr('transform-origin', `${this.outerWidth - this.width}px ${this.height / 2}px`)
            .attr('transform', `translate(${this.outerWidth - this.length},${this.params.padding.top}) rotate(-${Math.round(this.angle)})`);

        this.renderAxis();
        this.renderCircles();
        this.renderTicks();
        this.renderLegend();
    }

    renderCircles() {
        const simulation = d3.forceSimulation(this.data)
            .force('x', d3.forceX(d => this.xScale([...d.years][0])).strength(1))
            .force('y', d3.forceY(this.height / 2))
            .force('collide', d3.forceCollide(d => this.radiusScale(d.racesCount) - 2))
            .on('tick', d => {
                for (let i = 0; i < 40; i++) {
                    simulation.tick();
                }
            })
            .on('end', d => {
                circles
                    .transition()
                    .duration(500)
                    .attr('r', d => this.radiusScale(d.racesCount) - 2)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                this.renderLabels();
            });

        this.data.forEach(item => {
            const randomAngle = Math.random() * 2 * Math.PI;

            item.x = this.width / 2 + (this.width) * Math.cos(randomAngle);
            item.y = this.height / 2 + (this.width) * Math.sin(randomAngle);
        });

        const circles = this.chartContainer
            .selectAll('circle.bubble__pilot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'bubble__pilot')
            .attr('fill', d => this.getColor(d))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('r', 1)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .on('mouseover', this.onCircleMouseOver)
            .on('mouseout', this.onCircleMouseOut);

        d3.select('body')
            .append('div')	
            .attr('class', 'bubble__tooltip')				
            .style('opacity', 0);
    }

    renderAxis = () => {
        this.chartContainer.append('g')
            .attr('class', 'axis axis_type_x')
            .attr('transform', `translate(0,${this.height / 2})`)
            .call(d3.axisBottom(this.xScale).ticks(0).tickSize(0));
    };

    renderTicks = () => {
        const ticks = this.data
            .filter(d => d.type === 'year')
            .map(d => Object.assign(d, {
                fx: this.xScale([...d.years][0]),
                fy: this.height / 2,
            }));

        this.chartContainer.selectAll('text.year-tick')
            .data(ticks)
            .enter()
            .append('text')
            .attr('class', 'year-tick')
            .attr('text-anchor', 'middle')
            .attr('x', d => d.fx)
            .attr('y', d => d.fy)
            .attr('transform-origin', d => `${d.fx}px ${d.fy}px`)
            .attr('transform', `rotate(${Math.round(this.angle)}) translate(0,5)`)
            .text(d => d.name);
    };

    renderLegend = () => {
        const legend = this.svg
            .append('g')
            .attr('class', 'legend');

        const radiusData = [300, 250, 200, 150, 100, 50, 1];

        let prev = 0;
        legend
            .selectAll('circle')
            .data(radiusData)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => {
                const cx = this.params.padding.left + (this.radiusScale(d) - 2) + prev;

                prev += 2 * (this.radiusScale(d) - 2) + 5;

                return cx;
            })
            .attr('cy', d => this.height - this.radiusScale(d) - 2)
            .attr('r', d => this.radiusScale(d) - 2)
            .attr('fill', '#51a7ca');

        prev = 0;
        legend
            .selectAll('text.bubble__radius-label')
            .data(radiusData)
            .enter()
            .append('text')
            .attr('class', 'bubble__radius-label')
            .attr('text-anchor', 'middle')
            .attr('x', (d, i) => {
                const cx = this.params.padding.left + (this.radiusScale(d) - 2) + prev;

                prev += 2 * (this.radiusScale(d) - 2) + 5;

                return cx;
            })
            .attr('y', this.height + 10)
            .text(d => d);

        legend
            .append('text')
            .attr('x', this.params.padding.left)
            .attr('y', this.height - 2 * this.radiusScale(300) - 10)
            .text('Радиус круга зависит от количества гонок');

        const colorData = [0, 1, 2, 3, 4, 5, 6, 7];

        legend
            .selectAll('rect')
            .data(colorData)
            .enter()
            .append('rect')
            .attr('x', (d, i) => this.params.padding.left + 35 * i)
            .attr('y', this.height - 2 * this.radiusScale(300) - 100)
            .attr('width', 30)
            .attr('height', 10)
            .attr('fill', d => d ? this.colorScale(d) : '#51a7ca');

        legend
            .selectAll('text.bubble__color-label')
            .data(colorData)
            .enter()
            .append('text')
            .attr('class', 'bubble__color-label')
            .attr('text-anchor', 'middle')
            .attr('x', (d, i) => this.params.padding.left + 15 + 35 * i)
            .attr('y', this.height - 2 * this.radiusScale(300) - 75)
            .text(d => d);

        legend
            .append('text')
            .attr('x', this.params.padding.left)
            .attr('y', this.height - 2 * this.radiusScale(300) - 120)
            .text('Цвет круга зависит от количества чемпионских титулов');
    };

    renderLabels = () => {
        const labels = [{ 
            name: 'Nino Farina',
            label: 'Нино Фарина — победитель первого \nофициального Гран-при \nи первый чемпион мира \nв истории Формулы-1.'
        }];

        labels.forEach(item => {
            const pilot = this.data.find(pilot => pilot.name === item.name);

            const labelsContainer = this.chartContainer
                .append('g')
                .attr('class', 'bubble__labels');

            //console.log(pilot.y - this.height / 2);

            if (pilot.y > this.height / 2) {
                console.log(pilot.y, this.getMaxY(pilot.x, pilot.y));
                let length = (pilot.y - this.height / 2 > 200) 
                    ? 100 
                    : 40;

                const x2 = pilot.x;
                const y2 = pilot.y + length;

                const x3 = x2 + 100;
                const y3 = y2;

                labelsContainer.append('line')
                    .attr('x1', pilot.x)
                    .attr('y1', pilot.y)
                    .attr('x2', pilot.x)
                    .attr('y2', pilot.y + length)
                    .attr('stroke', '#333333');

                if (pilot.y - this.height / 2 < 200) {
                    labelsContainer.append('line')
                        .attr('x1', x2)
                        .attr('y1', y2)
                        .attr('x2', x3)
                        .attr('y2', y3)
                        .attr('stroke', '#333333');

                    labelsContainer.append('line')
                        .attr('x1', x3)
                        .attr('y1', y3 - 25)
                        .attr('x2', x3)
                        .attr('y2', y3 + 25)
                        .attr('stroke', '#333333');

                    const text = labelsContainer.append('text')
                        .attr('class', 'bubble__label')
                        .attr('x', x3 + 5)
                        .attr('y', y3 - 25);

                    item.label.split('\n').forEach(item => {
                        text.append('tspan')
                        .attr('x', x3 + 10)
                        .attr('dy', 12)
                        .text(item);
                    });
                }
            } else {
                labelsContainer.append('line')
                    .attr('x1', pilot.x)
                    .attr('y1', pilot.y)
                    .attr('x2', pilot.x)
                    .attr('y2', pilot.y - 50)
                    .attr('stroke', '#333333');
            }

            labelsContainer
                .attr('transform-origin', `${pilot.x}px ${pilot.y}px`)
                .attr('transform', `rotate(${Math.round(this.angle)})`);
        });

        
    };

    getMaxY = (x, y) => {
        return this.data.reduce((result, pilot) => {
            if (pilot.x > x && result < pilot.y) {
                result = pilot.y;
            }

            return result;
        }, y);
    };

    onCircleMouseOver = d => {
        if (d.type === 'year') {
            return;
        }

        const {pageX, pageY} = d3.event;

        d3.selectAll('.bubble__pilot')
            .filter(item => item.name === d.name)
            .attr('stroke', '#000000');

        d3.select('.bubble__tooltip')
            .html(`
                <h3>${d.name_ru}</h3>
                <p>Австралийский гонщик. Принял участие в ${d.racesCount} Гран-при Формулы-1 
                в 1958 году.</p>
                <p><a href="${d.url}" target="_blank">Подробнее</a></p>
            `)	
            .style('left', `${pageX}px`)		
            .style('top', `${pageY}px`)
            .attr('data-pilot', d.name)
            .transition()		
            .duration(100)		
            .style('opacity', 1);
    }

    onCircleMouseOut = d => {
        d3.selectAll('.bubble__pilot')
            .attr('stroke', '#ffffff');

        setTimeout(() => {
            const tooltip = d3.select(`.bubble__tooltip[data-pilot="${d.name}"]`);
            const tooltipNode = tooltip.node();

            if (tooltipNode && tooltipNode !== tooltipNode.parentElement.querySelector(':hover')) {
                d3.select('.bubble__tooltip')
                    .style('opacity', 0);
            }            
        }, 300);        
    };

    getColor = d => {
        if (d.type === 'year') {
            return '#ffffff';
        }

        return d.isChampion.size 
            ? this.colorScale(d.isChampion.size)
            : '#51a7ca';
    }
}

export default BubbleChart;