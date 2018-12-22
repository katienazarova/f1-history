import React from 'react';
import classNames from 'classnames';

import Filter from '../Filter';

import { transformData } from '../../utils/functions';
import SankeyChart from '../../charts/SankeyChart';

import './index.scss';

class RacesChart extends React.PureComponent {

    state = {
        filter: {
            year: '2018',
            grandPrix: 'Гран-при Абу-Даби'
        },
        years: [],
        grandPrix: {},
    };

    componentDidUpdate(prevProps) {
        const { data } = this.props;
        const { filter } = this.state;

        if (prevProps.data !== data) {
            const formattedData = transformData(data, filter);

            this.setState({
                years: formattedData.years,
                grandPrix: formattedData.grandPrix,
            });
            this.sankey = new SankeyChart(formattedData, 'svg#sankey', 'races-chart');
            this.sankey.render();
        }
    }

    onFilterChange = changes => {
        const {
            grandPrix,
            filter,
        } = this.state;

        if (changes.year) {
            changes.grandPrix = [...grandPrix[changes.year]][0];
        }

        this.setState({ filter: {...filter, ...changes} }, () => {
            this.updateData();
        });
    };

    updateData() {
        const { data } = this.props;
        const { filter } = this.state;
        const formattedData = transformData(data, filter);

        this.sankey.update(formattedData);
        this.sankey.render();
    }

    render() {
        const { 
            filter,
            years,
            grandPrix,
        } = this.state;

        const currentGrandPrix = grandPrix[filter.year]
            ? [...grandPrix[filter.year]]
            : [];

        return (
            <div className='races-chart'>
                <h2>Результаты гран-при</h2>
                <Filter
                    filter={filter}
                    years={years}
                    grandPrix={currentGrandPrix}
                    onChange={this.onFilterChange}
                />
                <svg
                    id='sankey'
                    width='100%'
                    height='600'
                />
            </div>
        );
    }
}

export default RacesChart;
