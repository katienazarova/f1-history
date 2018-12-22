import React from 'react';
import * as d3 from 'd3';
import classNames from 'classnames';

import RacesChart from '../RacesChart';
import PilotsChart from '../PilotsChart';
import GrandPrixMap from '../GrandPrixMap';

import './index.scss';

class Layout extends React.Component {
    componentWillMount() {
        d3.json('data/data.json')
            .then(data => {
                this.setState({ isLoading: false, data });
            });
    }

    state = {
        isLoading: true,
        data: {}
    };

    render() {
        const { className } = this.props;
        const {
            pilots,
            countries,
            raceResults,
        } = this.state.data;

        return <div className={classNames({
                'layout': true,
                [className]: className
            })}>

            <PilotsChart pilots={pilots} />

            <GrandPrixMap countries={countries} />

            <RacesChart data={raceResults} />

            <div className='layout__footer'>
                Катя Назарова
                {' '}
                <a
                    className="layout__footer-link"
                    href="https://twitter.com/katienazarova"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    @katienazarova
                </a>
                {' '}
                | 2018&nbsp;г.
            </div>
        </div>;
    }
}

export default Layout;
