import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './index.scss';

class Dropdown extends React.Component {

    static propTypes = {
        list: PropTypes.array.isRequired,
        current: PropTypes.string.isRequired,
        title: PropTypes.string,        
        columns: PropTypes.number,
        onChange: PropTypes.func        
    };

    static defaultProps = {
        title: '',
        list: [],
        current: '',
        columns: 1,
        onChange: null
    };

    state = {
        isActive: false
    };

    handleDocumentClick = (event) => {
        this.setState({ isActive: false });
    };

    componentDidMount() {
        window.document.addEventListener('click', this.handleDocumentClick, false);
    }

    componentWillUnmount() {
        window.document.removeEventListener('click', this.handleDocumentClick, false);
    }

    onChange = value => {
        this.setState({ isActive: false });
        this.props.onChange && this.props.onChange(value);
    };

    toggle = (event) => {
        this.setState({ isActive: !this.state.isActive });
        event.nativeEvent.stopImmediatePropagation();
    };

    render() {
        var columns = [],
            count = Math.ceil(this.props.list.length / this.props.columns);

        for (let i = 0; i < this.props.columns; i++) {
            columns.push(this.props.list.slice(count * i, count * i + count));
        }

        return <div className={classNames({
                            dropdown: true,
                            [this.props.className]: this.props.className
                        })}>

                <span className='dropdown__title'>{this.props.title}</span>

                <span className={classNames({
                            dropdown__label: true,
                            dropdown__label_state_open: this.state.isActive
                        })}
                      onClick={this.toggle}>

                    <span>{this.props.current}</span>
                </span>

                <div className='dropdown__list'
                     style={{ display: this.state.isActive ? 'flex' : 'none' }}>

                    {columns.map((items, i) => <div className='dropdown__list-in' key={i}>
                        {items.map(item => <div className={classNames({
                                                    dropdown__item: true,
                                                    dropdown__item_state_current: item === this.props.current
                                                })}
                                                key={item}
                                                onClick={this.onChange.bind(this, item)}>
                            <span>{item}</span>
                        </div>)}
                    </div>)}
                </div>
            </div>;
    }
}

export default Dropdown;
