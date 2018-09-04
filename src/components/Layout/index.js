import React from 'react';
import * as d3 from 'd3';
import classNames from 'classnames';

import Filter from '../Filter';

import Sankey from '../../Sankey.js';
import { transformDataForSankey } from '../../transformFunctions.js';

import '../../../build/fonts.css';

class Layout extends React.Component {
    componentWillMount() {
        d3.json('data/race_results.json')
            .then(data => {
                data = transformDataForSankey(data);
                this.setState({ isLoading: false, data });

                const sankey = new Sankey(data, d3.select('svg#sankey'));

                sankey.render();
            });
    }

    state = {
        isLoading: true,
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

        this.setState({ filter: {...this.state.filter, ...changes} });
    };

    render() {
        const { data, filter } = this.state;
        let filterFields;

        if (data.years) {
            filterFields = {
                year: { title: 'Сезон', data: [...data.years.keys()], columns: 7 },
                grandPrix: { title: 'Гран-при', data: [...data.years.get(filter.year)], columns: 3 }
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

            { !this.state.isLoading ?
                <div>
                    <div className='races_results'>
                        <Filter filter={filter}
                                fields={filterFields}
                                onChange={this.onFilterChange} />
                    </div>
                    <svg id="sankey" width="100%" height="700"></svg>
                </div>
            : null }
        </div>;
    }
}

export default Layout;
