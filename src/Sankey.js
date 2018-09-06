import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import colors from './colors';
import { parallelogram } from './customShapes';

class Sankey {
    constructor(data, svg) {
        this.data = data;
        this.svg = svg;

        this.width = svg.node().clientWidth;
        this.height = svg.node().clientHeight;

        this.params = {
            nodeWidth: 5,
            nodePadding: 10,
            padding: {
                top: 40,
                right: 40,
                bottom: 20,
                left: 200
            },
            transitionDuration: 300
        };

        this.sankeyFunc = sankey()
            .nodeId(d => d.name)
            .nodeWidth(this.params.nodeWidth)
            .nodePadding(this.params.nodePadding)
            .extent([
                [this.params.padding.left, this.params.padding.top],
                [this.width - this.params.padding.right, this.height - this.params.padding.bottom]
            ])
            .nodes(data.nodes)
            .links(data.links);
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
            .selectAll('rect.node')
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
            .attr('class', d => `node node_type_${d.type}`)
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
            .selectAll('text.node-label')
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
            .attr('class', 'node-label')
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
            .selectAll('path.link')
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
            .attr('class', 'link')
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

        for (let dimension of dimensions) {
            let node = this.sankey.nodes.find(item => item.type === dimension.name);
            let width = dimension.title.length * 10 + 20;

            this.svg
                .append('path')
                .attr('d', parallelogram(node.x0 - (width / 2), 0, width, 20, 5, 5))
                .attr('fill', '#ffea00');

            this.svg
                .append('text')
                .attr('class', `label label_type_${dimension.name}`)
                .text(dimension.title)
                .attr('text-anchor', 'middle')
                .attr('x', node.x0)
                .attr('y', 20);
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
        d3.selectAll('.link')
        .filter(item => {
            const intersection = new Set(
                [...item.pilots].filter(x => d.pilots.has(x))
            );
            
            return intersection.size;
        })
        .transition()
        .duration(this.params.transitionDuration / 2)
        .style('stroke-opacity', 0.9);

        d3.selectAll('.node-label')
            .filter(item => item.pilot && d.pilots.has(item.pilot.en))
            .style('font-family', 'RobotoBold');
    }

    onNodeMouseOver = d => {
        d3.selectAll('.link')
            .filter(item => {
                return d.type === 'pilot'
                    ? item.pilots.has(d.pilot.en)
                    : item[d.type] === d.name;            
            })
            .transition()
            .duration(10)
            .style('stroke-opacity', 0.9);

        d3.selectAll('.node-label')
            .filter(item => item[d.type] === d.name || item.name === d.name)
            .style('font-family', 'RobotoBold');
    }

    onMouseOut = d => {
        d3.selectAll('.link')
            .transition()
            .duration(10)
            .style('stroke-opacity', 0.5);

        d3.selectAll('.node')
            .transition()
            .duration(10)
            .attr('fill', '#000000');

        d3.selectAll('.node-label')
            .style('font-family', 'RobotoLight');
    };
}

export default Sankey;
