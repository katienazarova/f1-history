import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Dropdown from '../Dropdown';

import './index.scss';

class Filter extends React.PureComponent {
    static propTypes = {
        filter: PropTypes.object.isRequired,
        years: PropTypes.array.isRequired,
        grandPrix: PropTypes.array.isRequired,
        onChange: PropTypes.func,
    };

    static defaultProps = {
        filter: {},
        years: [],
        grandPrix: [],
        onChange: () => undefined,
    };

    onChangeYear = (value) => {
        const { onChange } = this.props;
        onChange({ year: value });
    };

    onChangeGrandPrix = (value) => {
        const { onChange } = this.props;
        onChange({ grandPrix: value });
    };

    render() {
        const {
            filter,
            years,
            grandPrix,
            className
        } = this.props;

        return <div className={classNames({
                'filter': true,
                [className]: className
            })}>
            <div className='filter__item'>
                <Dropdown
                    title="Сезон"
                    list={years}
                    current={filter.year}
                    columnsCount={7}
                    tabIndex={1}
                    onChange={this.onChangeYear} 
                />
            </div>
            <div className='filter__item'>
                <Dropdown
                    title="Гран-при"
                    list={grandPrix}
                    current={filter.grandPrix}
                    columnsCount={3}
                    tabIndex={2}
                    onChange={this.onChangeGrandPrix} 
                />
            </div>
        </div>;
    }
}

export default Filter;