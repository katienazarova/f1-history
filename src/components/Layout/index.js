import React from 'react';
import * as d3 from 'd3';
import classNames from 'classnames';

import Filter from '../Filter';

import Sankey from '../../Sankey.js';
import BubbleChart from '../../BubbleChart.js';
import { transformData } from '../../transformFunctions.js';

import '../../../build/fonts.css';

class Layout extends React.Component {
    componentWillMount() {
        Promise.all([
            d3.json('data/race_results.json'),
            d3.json('data/champions.json')
        ])
            .then(([rawData, championsData]) => {
                const data = transformData(rawData, championsData, this.state.filter);

                this.setState({ isLoading: false, rawData, championsData, data });

                this.sankey = new Sankey(data, d3.select('svg#sankey'));
                this.sankey.render();

                this.bubbleChart = new BubbleChart(data.pilots, d3.select('svg#bubbles'));
                this.bubbleChart.render();
            });
    }

    state = {
        isLoading: true,
        rawData: {},
        data: {},
        filter: {
            year: '1950',
            grandPrix: 'Гран-при Великобритании'
        }
    };

    onFilterChange = changes => {
        if (changes.year) {
            changes.grandPrix = [...this.state.data.years.get(changes.year)][0];
        }

        this.setState({ filter: {...this.state.filter, ...changes} }, () => {
            this.updateData();
        });      
    };

    updateData() {
        const data = transformData(this.state.rawData, this.state.championsData, this.state.filter);

        this.setState({ data });
        this.sankey.update(data);
        this.sankey.render();
    }

    render() {
        const { data, filter } = this.state;
        let filterFields;

        if (data.years) {
            filterFields = {
                year: { title: 'Сезон', data: [...data.years.keys()], columnsCount: 7 },
                grandPrix: { title: 'Гран-при', data: [...data.years.get(filter.year)], columnsCount: 3 }
            };
        }

        return <div className={classNames({
                'layout': true,
                [this.props.className]: this.props.className
            })}>
            <div className='header'>
                <div className='header__item'>
                    <h1 className='header__title'>Формула 1</h1>
                    <h4 className='header__subtitle'>С 1950-го до настоящего времени</h4>
                </div>
                <div className='header__item'>
                    <div className='text'>
                        <p>«Формула-1» — чемпионат мира по кольцевым автогонкам на автомобилях 
                        с открытыми колёсами. Чемпионат мира «Формулы-1» проводится каждый год 
                        и состоит из отдельных этапов. В конце года выявляется победитель чемпионата.</p>

                        <p>«Формула-1» — чемпионат мира по кольцевым автогонкам на автомобилях 
                        с открытыми колёсами. Чемпионат мира «Формулы-1» проводится каждый год 
                        и состоит из отдельных этапов. В конце года выявляется победитель чемпионата.</p>
                    </div>
                </div>                
            </div>

            <div className='layout__item'>
                <div className='layout__description'>
                    <h2>Пилоты</h2>
                    <div className='text'>
                        <p>«Формула-1» — чемпионат мира по кольцевым автогонкам на автомобилях 
                        с открытыми колёсами. Чемпионат мира «Формулы-1» проводится каждый год 
                        и состоит из отдельных этапов. В конце года выявляется победитель чемпионата.</p>
                    </div>
                </div>
                <svg id='bubbles' width='100%' height='600'></svg>
            </div>

            { !this.state.isLoading ?
                <div>
                    <div className='races_results'>
                        <Filter filter={filter}
                                fields={filterFields}
                                onChange={this.onFilterChange} />
                    </div>                   
                    <svg id='sankey' width='100%' height='600'></svg>
                </div>
            : null }
        </div>;
    }
}

export default Layout;
