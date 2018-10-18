import React from 'react';
import * as d3 from 'd3';
import classNames from 'classnames';

import Header from '../Header';
import RacesChart from '../RacesChart';
import PilotsChart from '../PilotsChart';

import { transformData } from '../../utils/functions';

import '../../../build/fonts.css';

class Layout extends React.Component {
    componentWillMount() {
        Promise.all([
            d3.json('data/race_results.json'),
            d3.json('data/champions.json'),
            d3.json('data/labels.json')
        ])
            .then(([rawData, championsData, labelsData]) => {
                const data = transformData(rawData, championsData, {
                    year: '1950',
                    grandPrix: 'Гран-при Великобритании'
                });

                this.setState({ isLoading: false, rawData, championsData, labelsData, data });
            });
    }

    state = {
        isLoading: true,
        rawData: {},
        data: {}
    };

    render() {
        const { 
            data, 
            rawData, 
            labelsData 
        } = this.state;

        return <div className={classNames({
                'layout': true,
                [this.props.className]: this.props.className
            })}>
            
            <Header />

            { !this.state.isLoading ?
                <PilotsChart pilots={data.pilots}
                             labels={labelsData} />
            : null }

            { !this.state.isLoading ?
                <RacesChart data={rawData} />
            : null }

            { /*!this.state.isLoading ?
                <div>
                    <div className='races_results'>
                        <Filter filter={filter}
                                fields={filterFields}
                                onChange={this.onFilterChange} />
                    </div>                   
                    <svg id='sankey' width='100%' height='600'></svg>
                </div>
            : null*/ }
        </div>;
    }
}

export default Layout;
