import * as d3 from 'd3';

import { generateRandomString } from '../utils/functions';

export default function withTooltip(...parameters) {
    return function decorator(Class) {
        return (...args) => {
            decorateMethod(Class, 'render', addTooltip, parameters);

            return new Class(...args);
        };
    }
}

function decorateMethod(Class, name, behavior, parameters) {
    const {
        defineProperty,
        getOwnPropertyDescriptor
    } = Object;

    const descriptor = getOwnPropertyDescriptor(Class.prototype, name);

    if (!descriptor || typeof descriptor.value !== 'function') {
        throw new SyntaxError(`@withTooltip needs a function called ${name}`);
    }

    const original = descriptor.value;

    descriptor.value = function(...args) {
        original.apply(this, args);
        behavior.apply(this, parameters);
    }

    defineProperty(Class.prototype, name, descriptor);
}

function addTooltip(...args) {
    const [
        selector,
        getName,
        width
    ] = args;

    const id = generateRandomString(6);

    d3
        .select('body')
        .append('div')	
        .attr('class', `tooltip tooltip-${id}`)
        .style('width', `${width}px`)
        .style('opacity', 0)
        .style('display', 'none');

    const params = { selector, getName, width, id };

    d3
        .selectAll(selector)
        .on('mouseover', onMouseOver.bind(this, params))
        .on('mouseout', onMouseOut.bind(this, params));
}

const onMouseOver = (params, d) => {
    const {
        pageX,
        pageY
    } = d3.event;

    const {
        selector,
        getName,
        width,
        id
    } = params;

    d3.selectAll(selector)
        .filter(item => getName(item) === getName(d))
        .attr('stroke', '#000000');

    const tooltip = d3.select(`.tooltip-${id}`);

    tooltip
        .html(d.description)
        .attr('data-name', getName(d))
        .style('display', 'block')
        .style('top', `${pageY}px`);

    if (document.body.clientWidth - pageX > width + 50) {
        tooltip.style('left', `${pageX}px`);
    } else {
        tooltip.style('right', `${document.body.clientWidth - pageX}px`);
    }

    tooltip
        .transition()
        .duration(100)		
        .style('opacity', 1);

    tooltip.on('mouseout', () => {
        hideTooltip(params, d);
    });
};

const onMouseOut = (params, d) => {
    hideTooltip(params, d);
};

const hideTooltip = (params, d) => {
    const {
        selector,
        getName,
        width,
        id
    } = params;

    setTimeout(() => {
        const area = d3.selectAll(selector)
                       .filter(item => getName(item) === getName(d));
        const areaNode = area.node();

        const tooltip = d3.select(`.tooltip-${id}[data-name="${getName(d)}"]`);
        const tooltipNode = tooltip.node();

        if (!tooltipNode
            || tooltipNode !== tooltipNode.parentElement.querySelector(':hover')
            && areaNode !== areaNode.parentElement.querySelector(':hover')) {
            area.attr('stroke', '#ffffff');
            tooltip
                .style('opacity', 0)
                .style('display', 'none');
        }            
    }, 300);
};

