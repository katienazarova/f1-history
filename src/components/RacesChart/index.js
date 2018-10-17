import React from 'react';
import classNames from 'classnames';

import Filter from '../Filter';

import { transformData } from '../../utils/functions';
import SankeyChart from '../../charts/SankeyChart';

import './index.scss';

class RacesChart extends React.Component {

    state = {
        filter: {
            year: '1950',
            grandPrix: 'Гран-при Великобритании'
        }
    };

    componentWillMount() {
        const data = transformData(this.props.data, [], this.state.filter);

        this.setState({ data });
    }

    componentDidMount() {
        this.sankey = new SankeyChart(this.state.data, 'svg#sankey', 'races-chart');
        this.sankey.render();
    }

    onFilterChange = changes => {
        if (changes.year) {
            changes.grandPrix = [...this.state.data.years.get(changes.year)][0];
        }

        this.setState({ filter: {...this.state.filter, ...changes} }, () => {
            this.updateData();
        });      
    };

    updateData() {
        const data = transformData(this.props.data, [], this.state.filter);

        this.setState({ data });

        this.sankey.update(data);
        this.sankey.render();
    }

    render() {
        const { 
            data,
            filter
        } = this.state;

        let filterFields;

        if (data.years) {
            filterFields = {
                year: { title: 'Сезон', data: [...data.years.keys()], columnsCount: 7 },
                grandPrix: { title: 'Гран-при', data: [...data.years.get(filter.year)], columnsCount: 3 }
            };
        }

        return <div className={classNames({
                'races-chart': true,
                [this.props.className]: this.props.className
            })}>
                <Filter filter={filter}
                        fields={filterFields}
                        onChange={this.onFilterChange} />
                <svg id='sankey' width='100%' height='600'></svg>
        </div>;
    }
}

export default RacesChart;
