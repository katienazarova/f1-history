import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Dropdown from '../Dropdown';

import './index.scss';

class Filter extends React.Component {

    static propTypes = {
        filter: PropTypes.object.isRequired,
        fields: PropTypes.object.isRequired,
        onChange: PropTypes.func        
    };

    static defaultProps = {
        filter: {},
        fields: {},
        onChange: null
    };

    onChange = (key, value) => {
        this.props.onChange && this.props.onChange({ [key]: value });
    };

    render() {
        const {
            filter,
            fields,
            className
        } = this.props;

        return <div className={classNames({
                'filter': true,
                [className]: className
            })}>

            { Object.keys(fields).map(item => <div className='filter__item' key={item}>
                <Dropdown
                    title={fields[item].title}
                    list={fields[item].data}
                    current={filter[item]}
                    columns={fields[item].columns}
                    onChange={this.onChange.bind(this, item)} 
                />
            </div>)}
        </div>;
    }
}

export default Filter;