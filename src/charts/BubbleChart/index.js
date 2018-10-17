import * as d3 from 'd3';
import debounce from 'lodash.debounce';

import { transformCoordinates } from '../../utils/functions';
import LabelComponent from './LabelComponent';

class BubbleChart {
    constructor(data, labels, container) {
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
        this.labels = labels;
        this.svg = d3.select(container);

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
            .domain(d3.range(...d3.extent(this.data, d => d.isChampion && d.isChampion.size || 0)))
            .range(['#51a7ca', '#50b229', '#f6b42a', '#e77820', '#d74e24', '#c21729'])
            .interpolate(d3.interpolateHcl);

        this.radiusScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.racesCount))
            .rangeRound([7, 35]);

        this.xScale = d3.scaleLinear()
            .domain([1940, 2040])
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
        const links = this.getLinks();

        const simulation = d3.forceSimulation(this.data)
            .force('x', d3.forceX(d => this.xScale([...d.years][0])).strength(1))
            .force('y', d3.forceY(this.height / 2))
            .force('link', d3.forceLink().links(links).distance(200))
            .force('collide', d3.forceCollide(d => this.radiusScale(d.racesCount) - 2).strength(1))
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
                    .attr('cy', d => d.y)
                    .attr('data-point', d => `${d.x},${d.y}`);

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
            .attr('data-pilot', d => d.name)
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

        this.chartContainer
            .selectAll('text.year-tick')
            .data(ticks)
            .enter()
            .append('text')
            .attr('class', 'year-tick')
            .attr('text-anchor', 'middle')
            .attr('x', d => d.fx)
            .attr('y', d => d.fy)
            .attr('transform', d => `rotate(${Math.round(this.angle)} ${d.fx} ${d.fy}) translate(0,5)`)
            .text(d => d.name);
    };

    getLinks = () => {
        const linkedPairs = [
            ['Nino Farina', 'Juan Fangio'],
            ['Ayrton Senna', 'Michael Schumacher']
        ];

        const links = [];

        linkedPairs.forEach(pair => {
            let source, 
                target;

            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].name === pair[0]) {
                    source = i;
                }

                if (this.data[i].name === pair[1]) {
                    target = i;
                }

                if (source !== undefined && target !== undefined) {
                    break;
                }
            }

            links.push({ source, target });
        });

        return links;
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
        const transformCoordsFunc = transformCoordinates(
            -this.angleRad,
            { x: this.outerWidth - this.width, y: this.height / 2 },
            this.outerWidth - this.length,
            this.params.padding.top
        );

        const labelComponent = new LabelComponent(
            this.data,
            this.chartContainer,
            this.width,
            this.height,
            this.angle,
            transformCoordsFunc
        );

        this.labels.forEach(item => {
            labelComponent.render(item, 'bubble__labels');
        });
    };

    onCircleMouseOver = d => {
        if (d.type === 'year') {
            return;
        }

        const {pageX, pageY} = d3.event;

        d3.selectAll('.bubble__pilot')
            .filter(item => item.name === d.name)
            .attr('stroke', '#000000');

        const tooltip = d3.select('.bubble__tooltip');

        tooltip
            .html(`
                <h3>${d.name_ru}</h3>
                <p>Принял участие в ${d.racesCount} Гран-при Формулы-1 ${this.formatYears(d.years)}.</p>
                ${ d.isChampion.size ? `<p>Завоевал чемпионский титул 
                в ${[...d.isChampion].join(', ')} ${d.isChampion.size === 1 ? 'году' : 'годах'}.<p>` : '' }
                <p><a href="${d.url}" target="_blank">Подробнее</a></p>
            `)	
            .style('left', `${pageX}px`)		
            .style('top', `${pageY}px`)
            .attr('data-pilot', d.name)
            .transition()		
            .duration(100)		
            .style('opacity', 1);

        tooltip.on('mouseout', () => {
            this.hideTooltip(d);
        });
    }

    onCircleMouseOut = d => {
        d3.selectAll('.bubble__pilot')
            .attr('stroke', '#ffffff');

        this.hideTooltip(d);
    };

    formatYears = years => {
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
    };

    hideTooltip = d => {
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
        return (d.type === 'year')
            ? '#ffffff'
            : this.colorScale(d.isChampion.size);
    }
}

export default BubbleChart;