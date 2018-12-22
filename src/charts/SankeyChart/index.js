import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import debounce from 'lodash.debounce';

import colors from '../../utils/colors';
import { parallelogram } from '../../utils/customShapes';

class SankeyChart {
    constructor(data, container, classPrefix) {
        this.data = data;
        this.svg = d3.select(container);
        this.classPrefix = classPrefix;

        this.params = {
            nodeWidth: 5,
            nodePadding: 10,
            padding: {
                top: 40,
                right: 40,
                bottom: 20,
                left: 150
            },
            transitionDuration: 300
        };

        this.layout();

        window.addEventListener('resize', debounce(() => {
            this.svg.selectAll('*').remove();

            this.layout();
            this.render();
        }));
    }

    layout() {
        this.width = this.svg.node().clientWidth;
        this.height = this.svg.node().clientHeight;

        this.sankeyFunc = sankey()
            .nodeId(d => d.name)
            .nodeWidth(this.params.nodeWidth)
            .nodePadding(this.params.nodePadding)
            .extent([
                [this.params.padding.left, this.params.padding.top],
                [this.width - this.params.padding.right, this.height - this.params.padding.bottom]
            ])
            .nodes(this.data.nodes)
            .links(this.data.links)
            .nodeSort(null);
        this.sankey = this.sankeyFunc();
    }

    update(data) {
        this.data = data;
        this.sankey = this.sankeyFunc
            .nodes(data.nodes)
            .links(data.links)();
    }

    render() {
        this.renderLinks();
        this.renderNodes();
        this.renderLabels();
    }

    renderNodes() {
        const nodes = this.svg
            .selectAll(`rect.${this.classPrefix}__node`)
            .data(this.sankey.nodes, d => d.name);

        nodes
            .transition()
            .duration(this.params.transitionDuration)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .on('interrupt', function(d) {
                d3.select(this)
                    .attr('y', d.y0)
                    .attr('height', d.y1 - d.y0);
            });

        nodes
            .enter()
            .append('rect')
            .attr('class', d => `${this.classPrefix}__node ${this.classPrefix}__node_type_${d.type}`)
            .attr('data-ref', d => d.name)
            .attr('x', d => d.x0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', '#000000')
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .on('mouseover', this.onNodeMouseOver)
            .on('mouseout', this.onMouseOut);

        nodes.exit().remove();

        const nodeLabels = this.svg
            .selectAll(`text.${this.classPrefix}__node-label`)
            .data(this.sankey.nodes, d => d.name);

        nodeLabels
            .transition()
            .duration(this.params.transitionDuration)
            .attr('y', d => (d.y1 + d.y0) / 2)
            .on('interrupt', function(d) {
                d3.select(this).attr('y', (d.y1 + d.y0) / 2);
            });

        nodeLabels
            .enter()
            .append('text')
            .attr('class', `${this.classPrefix}__node-label`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('x', d => d.x0 - 6)
            .attr('y', d => (d.y1 + d.y0) / 2)
            .text(d => d.title || d.name)
            .on('mouseover', this.onNodeMouseOver)
            .on('mouseout', this.onMouseOut)
            .filter(d => d.depth === 2)
            .attr('x', d => d.x1 + 6)
            .attr('text-anchor', 'start');

        nodeLabels.exit().remove();
    }

    renderLinks() {
        const links = this.svg
            .selectAll(`path.${this.classPrefix}__link`)
            .data(this.sankey.links);

        const self = this;

        links.exit().remove();

        links
            .attr('stroke', this.getLinkColor)
            .attr('stroke-width', d => Math.max(1, d.width))
            .transition()
            .duration(this.params.transitionDuration)
            .attr('d', this.getLinkShape)
            .on('interrupt', function(d) {
                d3.select(this).attr('d', self.getLinkShape);
            });

        links
            .enter()
            .append('path')
            .attr('class', `${this.classPrefix}__link`)
            .attr('d', this.getLinkShape)
            .attr('data-constructor', d => d.constructor)
            .attr('data-place', d => d.place)
            .attr('fill', 'none')
            .attr('stroke', this.getLinkColor)
            .attr('stroke-opacity', 0.5)
            .attr('stroke-width', d => Math.max(1, d.width))
            .on('mouseover', this.onLinkMouseOver)
            .on('mouseout', this.onMouseOut);
    }

    renderLabels() {
        const dimensions = [
            { name: 'pilot', title: 'Пилот' },
            { name: 'constructor', title: 'Конструктор' },
            { name: 'place', title: 'Место' }
        ];
        const color = getComputedStyle(document.body)
            .getPropertyValue('--base-color-lighter');

        for (let dimension of dimensions) {
            let node = this.sankey.nodes.find(item => item.type === dimension.name);
            let width = dimension.title.length * 8 + 10;

            const label = this.svg
                .selectAll(`.${this.classPrefix}__label_type_${dimension.name}`);

            if (label.size()) {
                label
                    .transition()
                    .duration(this.params.transitionDuration)
                    .attr('d', parallelogram(node.x0 - (width / 2) + 3, node.y0 - 40, width, 20, 5, 5));
            } else {
                this.svg
                    .append('path')
                    .attr('class', `${this.classPrefix}__label ${this.classPrefix}__label_type_${dimension.name}`)
                    .attr('d', parallelogram(node.x0 - (width / 2) + 3, node.y0 - 40, width, 20, 5, 5))
                    .attr('fill', color);
            }

            const labelText = this.svg
                .selectAll(`.${this.classPrefix}__label-text_type_${dimension.name}`);

            if (labelText.size()) {
                labelText
                    .transition()
                    .duration(this.params.transitionDuration)
                    .attr('x', node.x0)
                    .attr('y', node.y0 - 20);
            } else {
                this.svg
                .append('text')
                .attr('class', `${this.classPrefix}__label-text ${this.classPrefix}__label-text_type_${dimension.name}`)
                .text(dimension.title)
                .attr('text-anchor', 'middle')
                .attr('x', node.x0)
                .attr('y', node.y0 - 20);
            }
        }
    }

    getLinkColor = d => {
        const index = this.data.constructors.indexOf(d.constructor);

        return index > -1 
            ? colors[index]
            : 'rgb(0, 0, 0)';
    }

    getLinkShape = d => {
        return sankeyLinkHorizontal()({
            source: { x1: d.source.x1 + 5 },
            target: { x0: d.target.x0 - 5 },
            y0: d.y0,
            y1: d.y1
        });
    }

    onLinkMouseOver = d => {
        const fontFamily = getComputedStyle(document.body)
            .getPropertyValue('--font-family-black');

        d3.selectAll(`.${this.classPrefix}__link`)
        .filter(item => {
            const intersection = new Set(
                [...item.pilots].filter(x => d.pilots.has(x))
            );
            
            return intersection.size;
        })
        .transition()
        .duration(this.params.transitionDuration / 2)
        .style('stroke-opacity', 0.9);

        const isRelatedLabel = (item) => {
            return item.type === 'pilot' && d.pilots.has(item.name)
                || item.type === 'constructor' && item.name === d.constructor
                || item.type === 'place' && item.name === d.place;
        };

        d3.selectAll(`.${this.classPrefix}__node-label`)
            .filter(item => isRelatedLabel(item))
            .style('font-family', fontFamily);
    }

    onNodeMouseOver = d => {
        const fontFamily = getComputedStyle(document.body)
            .getPropertyValue('--font-family-black');

        d3.selectAll(`.${this.classPrefix}__link`)
            .filter(item => {
                return d.type === 'pilot'
                    ? item.pilots.has(d.name)
                    : item[d.type] === d.name;            
            })
            .transition()
            .duration(10)
            .style('stroke-opacity', 0.9);

        const isRelatedLabel = (item) => {
            return item.name === d.name
                || item[d.type] === d.name
                || d.type === 'pilot' && item.pilots && item.pilots.indexOf(d.name) > -1
                || d.type === 'constructor' && item.constructors && item.constructors.indexOf(d.name) > -1;
        };

        d3.selectAll(`.${this.classPrefix}__node-label`)
            .filter(item => isRelatedLabel(item))
            .style('font-family', fontFamily);
    }

    onMouseOut = d => {
        const fontFamily = getComputedStyle(document.body)
            .getPropertyValue('--font-family-thin');

        d3.selectAll(`.${this.classPrefix}__link`)
            .transition()
            .duration(10)
            .style('stroke-opacity', 0.5);

        d3.selectAll(`.${this.classPrefix}__node`)
            .transition()
            .duration(10)
            .attr('fill', '#000000');

        d3.selectAll(`.${this.classPrefix}__node-label`)
            .style('font-family', fontFamily);
    };
}

export default SankeyChart;
