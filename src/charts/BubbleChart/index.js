import * as d3 from 'd3';
import debounce from 'lodash.debounce';

import { transformCoordinates } from '../../utils/functions';
import LabelComponent from './LabelComponent';

class BubbleChart {
    constructor(data, labels, container, classPrefix) {
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
        this.classPrefix = classPrefix;

        this.params = {
            nodeWidth: 5,
            nodePadding: 10,
            topPadding: 40,
            bottomPadding: 70,
            transitionDuration: 300
        };

        this.isRenderingStarted = false;

        this.layout();

        window.addEventListener('resize', debounce(() => {
            this.svg.selectAll('*').remove();

            this.layout();
            this.render();
        }, 300));
    }

    layout() {
        this.documentWidth = document.body.clientWidth;

        if (this.documentWidth < 1200) {
            this.params.bottomPadding = 100;
        }

        if (this.documentWidth < 660) {
            this.params.bottomPadding = 0;
        }

        this.outerWidth = this.svg.node().clientWidth;
        this.outerHeight = this.svg.node().clientHeight;

        this.width = this.outerWidth;
        this.height = this.outerHeight - this.params.topPadding - this.params.bottomPadding;

        this.length = this.documentWidth < 660 
            ? this.width 
            : Math.sqrt(this.width * this.width + this.height * this.height);
        this.angleRad = Math.acos(this.width / this.length);
        this.angle = (this.angleRad * 180) / Math.PI;

        this.colorScale = d3.scaleLinear()
            .domain(d3.range(...d3.extent(this.data, d => d.isChampion && d.isChampion.size || 0)))
            .range(['#51a7ca', '#50b229', '#f6b42a', '#e77820', '#d74e24', '#c21729'])
            .interpolate(d3.interpolateHcl);

        const racesCountRange = this.documentWidth < 1200 ? [6, 20] : [7, 35];

        this.radiusScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.racesCount))
            .rangeRound(racesCountRange);

        this.xScale = d3.scaleLinear()
            .domain([1938, 2025])
            .range([0, this.length]);
    }

    render() {
        this.chartContainer = this.svg
            .append('g');

        if (this.documentWidth > 660) {
            this.chartContainer
                .attr('transform-origin', `0px ${this.height / 2 + this.params.topPadding}px`)
                .attr('transform', `translate(0,${this.height / 2 + this.params.topPadding}) rotate(-${Math.round(this.angle)})`);
        }

        //this.renderDebugInfo();
        this.renderAxis();
        this.renderCircles();
        this.renderLegend();
    }

    renderDebugInfo = () => {
        this.svg
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.outerWidth)
            .attr('y2', 0)
            .attr('stroke', '#ff0000')
            .attr('stroke-width', '1px');

        this.svg
            .append('line')
            .attr('x1', this.outerWidth - 1)
            .attr('y1', 0)
            .attr('x2', this.outerWidth - 1)
            .attr('y2', this.outerHeight)
            .attr('stroke', '#ff0000')
            .attr('stroke-width', '1px');

        this.svg
            .append('line')
            .attr('x1', 0)
            .attr('y1', this.outerHeight - 1)
            .attr('x2', this.outerWidth)
            .attr('y2', this.outerHeight - 1)
            .attr('stroke', '#ff0000')
            .attr('stroke-width', '1px');

        this.svg
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', this.outerHeight)
            .attr('stroke', '#ff0000')
            .attr('stroke-width', '1px');
    };

    renderCircles() {
        const links = this.getLinks();

        const simulation = d3.forceSimulation(this.data)
            .force('x', d3.forceX(d => this.xScale([...d.years][0])).strength(1))
            .force('y', d3.forceY(this.height / 2))
            .force('link', d3.forceLink().links(links).distance(this.documentWidth < 1200 ? 100: 200))
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
                this.renderTicks();
            });

        this.data
            .filter(d => d.type === 'year')
            .map(d => Object.assign(d, {
                fx: this.xScale([...d.years][0]),
                fy: this.height / 2,
            }));

        this.data.forEach(item => {
            const randomAngle = Math.random() * 2 * Math.PI;

            item.x = this.width / 2 + (this.width) * Math.cos(randomAngle);
            item.y = this.height / 2 + (this.width) * Math.sin(randomAngle);
        });

        const circles = this.chartContainer
            .selectAll(`circle.${this.classPrefix}__circle`)
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', `${this.classPrefix}__circle`)
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
            .attr('class', `${this.classPrefix}__tooltip`)				
            .style('opacity', 0);
    }

    renderAxis = () => {
        this.chartContainer.append('g')
            .attr('class', `${this.classPrefix}__axis`)
            .attr('transform', `translate(0,${this.height / 2})`)
            .call(d3.axisBottom(this.xScale).ticks(0).tickSize(0));
    };

    renderTicks = () => {
        const ticks = this.data
            .filter(d => d.type === 'year');

        this.chartContainer
            .selectAll(`text.${this.classPrefix}__year-tick`)
            .data(ticks)
            .enter()
            .append('text')
            .attr('class', `${this.classPrefix}__year-tick`)
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
            .attr('class', `${this.classPrefix}__legend`);

        this.renderRadiusLegend(legend);
        this.renderColorLegend(legend);
    };

    renderRadiusLegend = container => {
        const data = [300, 250, 200, 150, 100, 50, 1];

        let x = this.outerWidth - 310,
            y = this.outerHeight - 2 * this.radiusScale(300) - 20;

        if (this.documentWidth < 1200) {
            x = 0;
        }

        let prev = 0;
        container
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => {
                const cx = x + (this.radiusScale(d) - 2) + prev;

                prev += 2 * (this.radiusScale(d) - 2) + 5;

                return cx;
            })
            .attr('cy', d => y + (this.radiusScale(300) - this.radiusScale(d)) + this.radiusScale(300) + 5)
            .attr('r', d => this.radiusScale(d) - 2)
            .attr('fill', '#51a7ca');

        prev = 0;
        container
            .selectAll(`text.${this.classPrefix}__radius-label`)
            .data(data)
            .enter()
            .append('text')
            .attr('class', `${this.classPrefix}__radius-label`)
            .attr('text-anchor', 'middle')
            .attr('x', (d, i) => {
                const cx = x + (this.radiusScale(d) - 2) + prev;

                prev += 2 * (this.radiusScale(d) - 2) + 5;

                return cx;
            })
            .attr('y', y + 2 * this.radiusScale(300) + 15)
            .text(d => d);

        container
            .append('text')
            .attr('class', `${this.classPrefix}__legend-caption`)
            .attr('x', x)
            .attr('y', y)
            .text('Радиус круга зависит от количества гонок');
    };

    renderColorLegend = container => {
        const data = [0, 1, 2, 3, 4, 5, 6, 7];

        let x = this.outerWidth - 310,
            y = this.outerHeight - 150;

        if (this.documentWidth < 1200) {
            if (this.documentWidth < 660) {
                x = 0;
            } else {
                x = 350;
                y = this.outerHeight - 2 * this.radiusScale(300) - 20;
            }
        }

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
            .text('Цвет круга зависит от количества чемпионских титулов');
    };

    renderLabels = () => {
        if (this.documentWidth < 1200) {
            return;
        }

        this.svg
            .selectAll('.pilots-chart__labels')
            .remove();

        const transformCoordsFunc = transformCoordinates(
            -this.angleRad,
            { x: 0, y: this.height / 2 },
            this.outerWidth - this.length,
            this.params.topPadding
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
            labelComponent.render(item, `${this.classPrefix}__labels`);
        });
    };

    onCircleMouseOver = d => {
        if (d.type === 'year') {
            return;
        }

        const {pageX, pageY} = d3.event;

        d3.selectAll(`.${this.classPrefix}__circle`)
            .filter(item => item.name === d.name)
            .attr('stroke', '#000000');

        const tooltip = d3.select(`.${this.classPrefix}__tooltip`);

        tooltip
            .html(`
                <h3 class="${this.classPrefix}__tooltip-header">${d.name_ru}</h3>
                <p>Принял участие в ${d.racesCount} Гран-при Формулы-1 ${this.formatYears(d.years)}.</p>
                ${ d.isChampion.size ? `<p>Завоевал чемпионский титул 
                в ${[...d.isChampion].join(', ')} ${d.isChampion.size === 1 ? 'году' : 'годах'}.<p>` : '' }
                <p><a class="${this.classPrefix}__tooltip-link" href="${d.url}" target="_blank">Подробнее</a></p>
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
        d3.selectAll(`.${this.classPrefix}__circle`)
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
            const tooltip = d3.select(`.${this.classPrefix}__tooltip[data-pilot="${d.name}"]`);
            const tooltipNode = tooltip.node();

            if (tooltipNode && tooltipNode !== tooltipNode.parentElement.querySelector(':hover')) {
                d3.select(`.${this.classPrefix}__tooltip`)
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