import * as d3 from 'd3';
import debounce from 'lodash.debounce';

import { transformCoordinates } from '../../utils/functions';
import withTooltip from '../../decorators/withTooltip';
import LabelComponent from './LabelComponent';

@withTooltip(
    '.bubble',
    item => item.name,
    200
)
class BubbleChart {
    constructor(data, labels, container, classPrefix) {
        const ticksData = ['1950', '1970', '1990', '2010'].map(year => ({
            name: year,
            racesCount: 250, 
            type: 'year', 
            isChampion: [], 
            years: [year]
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
        const DEFAULT_WIDTH = 1200;
        const DEFAULT_HEIGHT = 700;

        this.outerWidth = this.svg.node().clientWidth;
        this.outerHeight = this.isPortrait()
            ? 450
            : (this.outerWidth * DEFAULT_HEIGHT) / DEFAULT_WIDTH;

        this.width = this.outerWidth;
        this.height = this.outerHeight - this.params.topPadding - this.params.bottomPadding;

        this.length = this.isMobile() 
            ? this.width 
            : Math.sqrt(this.width * this.width + this.height * this.height);
        this.angleRad = Math.acos(this.width / this.length);
        this.angle = (this.angleRad * 180) / Math.PI;

        this.colorScale = d3.scaleLinear()
            .domain(d3.range(...d3.extent(this.data, d => d.isChampion && d.isChampion.length || 0)))
            .range(['#51a7ca', '#50b229', '#f6b42a', '#e77820',
                    '#d74e24', '#c21729', '#a8002d', '#8b002f'])
            .interpolate(d3.interpolateHcl);

        const racesCountRange = this.isDesktopLarge()
            ? [7, 35]
            : this.isMobile() ? [5, 18] : [6, 25];

        this.radiusScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => d.racesCount))
            .rangeRound(racesCountRange);

        this.xScale = d3.scaleLinear()
            .domain([1938, 2025])
            .range([0, this.length]);

        this.svg.attr('height', this.outerHeight);
    }

    render() {
        this.chartContainer = this.svg
            .append('g');

        if (!this.isMobile()) {
            this.chartContainer
                .attr('transform-origin', `0px ${this.height / 2 + this.params.topPadding}px`)
                .attr('transform', `translate(0,${this.height / 2 + this.params.topPadding})
                                    rotate(-${Math.round(this.angle)})`);
        }

        this.renderAxis();
        this.renderCircles();
        this.renderLegend();
    }

    renderCircles() {
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
            .attr('class', d => `${this.classPrefix}__circle ${d.type !== 'year' ? 'bubble' : ''}`)
            .attr('data-pilot', d => d.name)
            .attr('fill', d => this.getColor(d))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('r', 1)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        this.runSimulation(circles);
    }

    runSimulation = (circles) => {
        const links = this.getLinks();

        const simulation = d3.forceSimulation(this.data)
            .force('x', d3.forceX(d => this.xScale([...d.years][0])).strength(1))
            .force('y', d3.forceY(this.height / 2))
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

        if (this.isDesktopLarge()) {
            simulation.force('link', d3.forceLink().links(links).distance(200));
        }
    };

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
            ['Нино Фарина', 'Хуан Мануэль Фанхио'],
            ['Айртон Сенна', 'Михаэль Шумахер']
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

            if (source && target) {
                links.push({ source, target });
            }            
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

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        let x = this.outerWidth - 280,
            y = this.outerHeight - 2 * this.radiusScale(300) - 20;

        if (this.isMobile()) {
            x = 0;
        }

        let prev = 0;
        container
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', `${this.classPrefix}__legend-item`)
            .attr('cx', d => {
                const cx = x + (this.radiusScale(d) - 2) + prev;

                prev += 2 * (this.radiusScale(d) - 2) + 5;

                return cx;
            })
            .attr('cy', d => y + (this.radiusScale(300) - this.radiusScale(d)) + this.radiusScale(300) + 5)
            .attr('r', d => this.radiusScale(d) - 2)
            .attr('fill', baseColor)
            .on('mouseover', d => {
                const dIndex = data.findIndex(item => item === d);

                d3.selectAll(`.${this.classPrefix}__circle`)
                    .filter(item => {
                        return item.type !== 'year'
                            && (item.racesCount < d
                            || (dIndex && item.racesCount > data[dIndex - 1]));
                    })
                    .transition()
                    .attr('fill', '#cccccc');
            })
            .on('mouseout', d => {
                d3.selectAll(`.${this.classPrefix}__circle`)
                    .transition()
                    .attr('fill', d => this.getColor(d));
            });

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
            .text('Радиус зависит от количества гонок');
    };

    renderColorLegend = container => {
        const data = [0, 1, 2, 3, 4, 5, 6, 7];

        const isMobile = this.isMobile();
        const isPortrait = this.isPortrait();

        let x = this.outerWidth - 280,
            y = this.outerHeight - 2 * this.radiusScale(300) - 90;

        if (isMobile && !isPortrait) {
            x = 230;
            y = this.outerHeight - 2 * this.radiusScale(300) - 20;
        }

        if (isMobile && isPortrait) {
            x = 0;
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
            .attr('fill', d => d ? this.colorScale(d) : '#51a7ca')
            .on('mouseover', d => {
                d3.selectAll(`.${this.classPrefix}__circle`)
                    .filter(item => item.type !== 'year' && item.isChampion.length !== d)
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
            .text('Цвет зависит от количества чемпионских титулов');
    };

    renderLabels = () => {
        if (!this.isDesktopLarge()) {
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

    getColor = d => {
        return (d.type === 'year')
            ? '#ffffff'
            : this.colorScale(d.isChampion.length);
    };

    isMobile = () => {
        return window.innerWidth < 768;
    };

    isDesktop = () => {
        return window.innerWidth > 1000;
    };

    isDesktopLarge = () => {
        return window.innerWidth > 1200;
    };

    isPortrait = () => {
        return window.innerWidth < window.innerHeight;
    };
}

export default BubbleChart;