class LabelComponent {
    constructor(data, container, width, height, angle, transformCoordinates) {
        this.data = data;
        this.container = container;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.transformCoordinates = transformCoordinates;
    }

    render(label, className) {
        const currentElement = this.data.find(item => item.name === label.name);

        const container = this.container
            .append('g')
            .attr('class', className);

        const lastRightElement = this.getLastRightElement();

        if (currentElement.y < this.height / 2) {
            if (currentElement.x < this.width / 2) {
                this.renderLeftTopLabel(label, currentElement, container);
            }

            if (currentElement.x > this.width / 2) {
                if (lastRightElement.x - currentElement.x < 150) {
                    this.renderSideTopLabel(label, currentElement, container);
                } else {
                    this.renderRightTopLabel(label, currentElement, container);
                }                
            }
        }

        if (currentElement.y > this.height / 2) {
            if (currentElement.x < this.width / 2) {
                this.renderLeftBottomLabel(label, currentElement, container);
            }

            if (currentElement.x > this.width / 2) {
                if (lastRightElement.x - currentElement.x < 150) {
                    this.renderSideBottomLabel(label, currentElement, container, lastRightElement);
                } else {
                    this.renderRightBottomLabel(label, currentElement, container);
                }                
            }
        }

        container
            .attr('transform', `rotate(${Math.round(this.angle)} ${currentElement.x} ${currentElement.y})`);
    }

    renderLeftBottomLabel(label, currentElement, container) {
        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x + 100;
        const y2 = currentElement.y;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2)
            .attr('y1', y2 - 25)
            .attr('x2', x2)
            .attr('y2', y2 + 25)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('x', x2 + 5)
            .attr('y', y2 - 25);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x2 + 5)
                .attr('dy', 11)
                .text(item);
        });
    }

    renderLeftTopLabel(label, currentElement, container) {
        const highestElement = this.getHighestElement(currentElement, 100);

        const length = this.transformCoordinates(currentElement).y - this.transformCoordinates(highestElement).y + 20;

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x;
        const y2 = currentElement.y - length;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2 - 80)
            .attr('y1', y2)
            .attr('x2', x2 + 80)
            .attr('y2', y2)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('x', x2 - 80)
            .attr('y', y2 - 50);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x2 - 80)
                .attr('dy', 11)
                .text(item);
        });
    }

    renderRightBottomLabel(label, currentElement, container) {
        const lowestElement = this.getLowestElement(currentElement, 110, 'left');

        const length = this.transformCoordinates(lowestElement).y 
            - this.transformCoordinates(currentElement).y + 40;

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x;
        const y2 = currentElement.y + length;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2 - 100)
            .attr('y1', y2)
            .attr('x2', x2 + 100)
            .attr('y2', y2)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('x', x2 - 100)
            .attr('y', y2 + 3);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x2 - 100)
                .attr('dy', 11)
                .text(item);
        });
    }

    renderRightTopLabel(label, currentElement, container) {
        const highestElement = this.getHighestElement(currentElement, null, 'left');

        const length = this.transformCoordinates(currentElement).y 
            - this.transformCoordinates(highestElement).y + 30;

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x;
        const y2 = currentElement.y - length;

        const x3 = x2 - 50;
        const y3 = y2;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2)
            .attr('y1', y2)
            .attr('x2', x3)
            .attr('y2', y3)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x3)
            .attr('y1', y3 - 21)
            .attr('x2', x3)
            .attr('y2', y3 + 21)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('text-anchor', 'end')
            .attr('x', x3 - 5)
            .attr('y', y3 - 23);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x3 - 5)
                .attr('dy', 11)
                .text(item);
        });
    }

    renderSideTopLabel(label, currentElement, container) {
        const highestElement = this.getHighestElement(currentElement);

        const length = this.transformCoordinates(currentElement).y - this.transformCoordinates(highestElement).y + 40;

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x;
        const y2 = currentElement.y - length;

        const x3 = x2 + 50;
        const y3 = y2;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2)
            .attr('y1', y2)
            .attr('x2', x3)
            .attr('y2', y3)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x3)
            .attr('y1', y3 - 25)
            .attr('x2', x3)
            .attr('y2', y3 + 25)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('class', 'bubble__label')
            .attr('x', x3 + 5)
            .attr('y', y3 - 25);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x3 + 5)
                .attr('dy', 11)
                .text(item);
        });
    }

    renderSideBottomLabel(label, currentElement, container, lastRightElement) {
        const length = this.transformCoordinates(lastRightElement).x - this.transformCoordinates(currentElement).x + 20;

        const baseColor = getComputedStyle(document.body)
            .getPropertyValue('--base-color');

        const x2 = currentElement.x + length;
        const y2 = currentElement.y;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x2)
            .attr('y1', y2 - 25)
            .attr('x2', x2)
            .attr('y2', y2 + 25)
            .attr('stroke', baseColor)
            .attr('stroke-width', 3);

        const text = container
            .append('text')
            .attr('class', 'bubble__label')
            .attr('x', x2 + 5)
            .attr('y', y2 - 25);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x2 + 5)
                .attr('dy', 11)
                .text(item);
        });
    }

    checkX = (direction) => {
        if (direction === 'right') {
            return (startX, currentX, length) => currentX > startX 
                && (length === null || (currentX - startX) < length);
        } else {
            return (startX, currentX, length) => currentX < startX 
                && (length === null || (startX - currentX) < length);
        }
    };

    getBoundaries = () => {
        const lastRightElement = this.getLastRightElement();
        const firstLeftElement = this.getFirstLeftElement();
        const highestElement = this.getHighestElement(this.data[0]);
        const lowestElement = this.getLowestElement(this.data[0]);

        return {
            top: highestElement.y,
            right: lastRightElement.x,
            bottom: lowestElement.y,
            left: firstLeftElement.x
        };
    };

    getLowestElement = (startElement, length = null, direction = 'right') => {
        const startCoords = this.transformCoordinates(startElement);

        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (this.checkX(direction)(startCoords.x, currentCoords.x, length)) {
                if (resultCoords.y < currentCoords.y) {
                    result = current;
                }
            }

            return result;
        }, startElement);
    };

    getHighestElement = (startElement, length = null, direction = 'right') => {
        const startCoords = this.transformCoordinates(startElement);

        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (this.checkX(direction)(startCoords.x, currentCoords.x, length)) {
                if (resultCoords.y > currentCoords.y) {
                    result = current;
                }
            }

            return result;
        }, startElement);
    };

    getFirstLeftElement = () => {
        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (resultCoords.x > currentCoords.x) {
                result = current;
            }

            return result;
        }, this.data[0]);
    };

    getLastRightElement = () => {
        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (resultCoords.x < currentCoords.x) {
                result = current;
            }

            return result;
        }, this.data[0]);
    };
}

export default LabelComponent;