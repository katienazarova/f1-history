class LabelComponent {
    constructor(data, container, width, height, angle, transformCoordinates) {
        this.data = data;
        this.container = container;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.transformCoordinates = transformCoordinates;
    }

    render(label) {
        const currentElement = this.data.find(item => item.name === label.name);

        const container = this.container
            .append('g')
            .attr('class', 'bubble__labels');

        if (currentElement.y < this.height / 2) {
            if (currentElement.x < this.width / 2) {
                this.renderLeftTopLabel(label, currentElement, container);
                console.log(label, 'LeftTop');
            }

            if (currentElement.x > this.width / 2) {
                console.log(label, 'LeftBottom');
            }
        }

        if (currentElement.y > this.height / 2) {
            if (currentElement.x < this.width / 2) {
                this.renderLeftBottomLabel(label, currentElement, container);
            }

            if (currentElement.x > this.width / 2) {
                console.log(label, 'RightBottom');
                //this.renderRightBottomLabel(label, currentElement, container);
            }
        }

        container
            .attr('transform', `rotate(${Math.round(this.angle)} ${currentElement.x} ${currentElement.y})`);
    }

    renderLeftBottomLabel(label, currentElement, container) {
        const lowestElement = this.getLowestElement(currentElement);

        const length = this.transformCoordinates(lowestElement).y - this.transformCoordinates(currentElement).y + 20;

        const x2 = currentElement.x;
        const y2 = currentElement.y + length;

        const x3 = x2 + 100;
        const y3 = y2;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', currentElement.x)
            .attr('y2', currentElement.y + length)
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
            .attr('stroke', '#333333');

        const text = container
            .append('text')
            .attr('class', 'bubble__label')
            .attr('x', x3 + 5)
            .attr('y', y3 - 25);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x3 + 10)
                .attr('dy', 12)
                .text(item);
        });
    }

    renderLeftTopLabel(label, currentElement, container) {
        const highestElement = this.getHighestElement(currentElement, 100);

        this.container
            .select(`.bubble__pilot[data-pilot="${currentElement.name}"]`)
            .attr('fill', 'black');

        this.container
            .select(`.bubble__pilot[data-pilot="${highestElement.name}"]`)
            .attr('fill', 'purple');

        const length = this.transformCoordinates(currentElement).y - this.transformCoordinates(highestElement).y + 20;

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
            .attr('x1', x2 - 100)
            .attr('y1', y2)
            .attr('x2', x2 + 100)
            .attr('y2', y2)
            .attr('stroke', '#333333');

        const text = container
            .append('text')
            .attr('class', 'bubble__label')
            .attr('x', x2 - 100)
            .attr('y', y2 - 60);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x2 - 100)
                .attr('dy', 12)
                .text(item);
        });
    }

    renderRightBottomLabel(label, currentElement, container) {
        const lowestElement = this.getLowestElement(currentElement);

        const length = lowestElement.y - currentElement.y + 5;

        const x2 = currentElement.x;
        const y2 = currentElement.y + length;

        const x3 = x2 + 100;
        const y3 = y2;

        container
            .append('line')
            .attr('x1', currentElement.x)
            .attr('y1', currentElement.y)
            .attr('x2', currentElement.x)
            .attr('y2', currentElement.y + length)
            .attr('stroke', '#333333');

        container
            .append('line')
            .attr('x1', x3)
            .attr('y1', y3)
            .attr('x2', x3 + 200)
            .attr('y2', y3)
            .attr('stroke', '#333333');

        /*container
            .append('line')
            .attr('x1', x3)
            .attr('y1', y3 - 25)
            .attr('x2', x3)
            .attr('y2', y3 + 25)
            .attr('stroke', '#333333');

        const text = container
            .append('text')
            .attr('class', 'bubble__label')
            .attr('x', x3 + 5)
            .attr('y', y3 - 25);

        label.text.split('\n').forEach(item => {
            text.append('tspan')
                .attr('x', x3 + 10)
                .attr('dy', 12)
                .text(item);
        });*/
    }

    getLowestElement = (startElement, maxX = null) => {
        const startCoords = this.transformCoordinates(startElement);

        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (currentCoords.x > startCoords.x && (maxX === null || currentCoords.x < maxX)) {
                if (resultCoords.y < currentCoords.y) {
                    result = current;
                }
            }

            return result;
        }, startElement);
    };

    getHighestElement = (startElement, length = null) => {
        const startCoords = this.transformCoordinates(startElement);

        return this.data.reduce((result, current) => {
            const resultCoords = this.transformCoordinates(result);
            const currentCoords = this.transformCoordinates(current);

            if (currentCoords.x > startCoords.x
                && ((currentCoords.x - startCoords.x) < length || length === null)) {
                this.container
                    .select(`.bubble__pilot[data-pilot="${current.name}"]`)
                    .attr('fill', 'gray');

                if (resultCoords.y > currentCoords.y) {
                    result = current;
                }
            }

            return result;
        }, startElement);
    };
}

export default LabelComponent;