import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import colors from './colors';

class Sankey {
    constructor(data, svg) {
        this.data = data;
        this.svg = svg;

        this.width = svg.node().clientWidth;
        this.height = svg.node().clientHeight;

        this.sankey = sankey()
            .nodeId(function(d) { return d.name; })
            .nodeWidth(5)
            .nodePadding(10)
            .extent([[200, 20], [this.width - 1, this.height - 20]])
            .nodes(data.nodes)
            .links(data.links)();
    }

    render() {
        const links = this.svg
            .append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(this.sankey.links)
            .enter()
            .append('path')
            .attr('d', d => {
                return sankeyLinkHorizontal()({
                    source: { x1: d.source.x1 + 5 },
                    target: { x0: d.target.x0 - 5 },
                    y0: d.y0,
                    y1: d.y1
                });
            })
            .attr('class', d => `link ${d.source.name} ${d.target.name}`)
            .attr('fill', 'none')
            .attr('stroke', d => {
                const index = this.data.constructors.indexOf(d.constructor);

                return index > -1 
                    ? `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})` 
                    : 'rgb(0, 0, 0)';
            })
            .attr('stroke-opacity', 0.5)
            .attr('stroke-width', d => Math.max(1, d.width))
            .append('title')
            .text(d => d.source.name + " → " + d.target.name + "\n" + d.value);

        const nodes = this.svg
            .append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(this.sankey.nodes, function(d) { return d.name; });

        var nodeEnter = nodes.enter().append("g");

        nodeEnter.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", '#000000');
            /*.on("mouseover", function (d) {
                d3.selectAll(".link").filter("." + nospace(d.name)).transition().duration(10).style("stroke", "darkred").style("opacity", 0.6);
            })
            .on("mouseout", function (d) {
                d3.selectAll(".link").transition().duration(10).style("stroke", "#000").style("opacity", 0.15)
            });*/

        nodeEnter.append("text")
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .text(d => d.title || d.name)
            .filter(function(d) { return d.x0 < this.width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

        nodeEnter.append("title")
            .text(function(d) { return d.name + "\n" + d.value; });

        nodes.select("title")
            .text(function(d) { return d.name + "\n" + d.value; });
    }

    setColors(graph) {
        const pilots = graph.nodes.filter(item => item.depth === 0);

        pilots.forEach((item, index) => {
            item.color = colors[index] 
                ? `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})` 
                : 'rgb(203, 204, 232)';
        });

        graph.nodes.forEach(item => {
            if (!item.color) {
                item.color = 'rgb(0, 0, 0)';
            }
        });
    }
}

export default Sankey;
