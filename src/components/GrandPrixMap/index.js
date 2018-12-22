import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import WorldMap from '../../charts/WorldMap';

import './index.scss';

class GrandPrixMap extends React.Component {

    static propTypes = {
        countries: PropTypes.object,       
    };

    static defaultProps = {
        countries: {},
    };

    componentDidUpdate() {
        const { countries } = this.props;

        d3.json('data/topoworld.json')
            .then(mapData => {
                this.map = new WorldMap(mapData, countries, 'svg#grand_prix', 'grand-prix-map');
                this.map.render();
            });
    }

    render() {
        return <div className={classNames({
                'grand-prix-map': true,
                [this.props.className]: this.props.className
            })}>
                <h2>Гран-при на карте</h2>
                <svg id='grand_prix' width='100%' height='250px'></svg>
        </div>;
    }
}

export default GrandPrixMap;
