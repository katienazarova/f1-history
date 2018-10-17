import React from 'react';
import classNames from 'classnames';

import BubbleChart from '../../charts/BubbleChart';

import './index.scss';

class PilotsChart extends React.Component {

    componentDidMount() {
        const {
            pilots,
            labels
        } = this.props;

        this.chart = new BubbleChart(pilots, labels, 'svg#bubbles');
        this.chart.render();
    }

    render() {
        return <div className={classNames({
                'pilots-chart': true,
                [this.props.className]: this.props.className
            })}>
                <div className='pilots-chart__description'>
                    <h2>Пилоты</h2>
                    <div className='text'>
                        <p>«Формула-1» — чемпионат мира по кольцевым автогонкам на автомобилях 
                        с открытыми колёсами. Чемпионат мира «Формулы-1» проводится каждый год 
                        и состоит из отдельных этапов. В конце года выявляется победитель чемпионата.</p>
                    </div>
                </div>
                <svg id='bubbles' width='100%' height='600'></svg>
        </div>;
    }
}

export default PilotsChart;
