import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BubbleChart from '../../charts/BubbleChart';

import './index.scss';

class PilotsChart extends React.Component {

    static propTypes = {
        pilots: PropTypes.array,       
    };

    static defaultProps = {
        pilots: [],
    };

    componentDidUpdate() {
        const { pilots } = this.props;

        d3.json('data/labels.json')
            .then(labels => {
                this.chart = new BubbleChart(pilots, labels, 'svg#bubbles', 'pilots-chart');
                this.chart.render();
            });
    }

    render() {
        return <div className={classNames({
                'pilots-chart': true,
                [this.props.className]: this.props.className
            })}>
                <div className='pilots-chart__header'>
                    <h1 className='pilots-chart__title'>Формула-1</h1>
                    <h2  className='pilots-chart__subtitle'>С 1950-го до настоящего времени</h2>                    
                </div>

                <div  className='pilots-chart__info'>
                    Источники данных:<br/>
                    <a href="http://ergast.com/mrd/" target="_blank">Ergast Developer API</a><br/>
                    <a href="https://www.wikipedia.org/" target="_blank">Wikipedia</a>
                </div>

                <svg id='bubbles' width='100%' height='700'></svg>
        </div>;
    }
}

export default PilotsChart;
