import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './index.scss';

class Dropdown extends React.Component {

    static propTypes = {
        list: PropTypes.array.isRequired,
        current: PropTypes.string.isRequired,
        title: PropTypes.string,        
        columnsCount: PropTypes.number,
        tabIndex: PropTypes.number,
        onChange: PropTypes.func        
    };

    static defaultProps = {
        title: '',
        list: [],
        current: '',
        columnsCount: 1,
        tabIndex: 1,
        onChange: null
    };

    state = {
        isActive: false,
        isFocused: false,
        focusedItemIndex: -1
    };

    componentDidMount() {
        window.document.addEventListener('click', this.handleDocumentClick, false);
    }

    componentWillUnmount() {
        window.document.removeEventListener('click', this.handleDocumentClick, false);
    }

    handleDocumentClick = () => {
        this.close();
    };

    onItemClick = value => {
        this.setState({ isActive: false });
        this.props.onChange && this.props.onChange(value);
    };

    onFocus = () => {
        this.setState({ isFocused: true });
        this.props.onFocus && this.props.onFocus();
    };

    onBlur = () => {
        this.setState({ isFocused: false });
        this.props.onBlur && this.props.onBlur();
    };

    onKeyPressed = (event) => {
        if (event.nativeEvent.key === 'ArrowDown') {
            if (this.state.isActive) {
                const items = this.refs.list.querySelectorAll('.dropdown__item');
                let { focusedItemIndex } = this.state;

                focusedItemIndex = focusedItemIndex < items.length - 1 
                    ? focusedItemIndex + 1 
                    : 0;
                items[focusedItemIndex].focus();
                this.setState({ focusedItemIndex });
            } else {
                this.setState({ isActive: true });
            }
        }

        if (event.nativeEvent.key === 'ArrowUp') {
            if (this.state.isActive) {
                const items = this.refs.list.querySelectorAll('.dropdown__item');
                let { focusedItemIndex } = this.state;

                focusedItemIndex = focusedItemIndex > 0 
                    ? focusedItemIndex - 1 
                    : items.length - 1;
                items[focusedItemIndex].focus();
                this.setState({ focusedItemIndex });
            }
        }

        if (event.nativeEvent.key === 'Escape') {
            if (this.state.isActive) {
                this.close();
            }
        }
    };

    onItemKeyPressed = (value, event) => {
        if (event.nativeEvent.key === 'Enter') {
            this.setState({ isActive: false });
            this.props.onChange && this.props.onChange(value);
        }        
    };

    toggle = (event) => {
        this.setState({ 
            isActive: !this.state.isActive,
            focusedItemIndex: -1
        }, () => {
            if (this.state.isActive) {
                const items = this.refs.list.querySelectorAll('.dropdown__list-in');

                const { 
                    sumWidth,
                    maxWidth 
                } = [...items].reduce((result, item) => {
                    result.sumWidth = result.sumWidth + item.clientWidth;
                    result.maxWidth = (item.clientWidth > result.maxWidth)
                        ? item.clientWidth
                        : result.maxWidth;

                    return result;
                }, { sumWidth: 0, maxWidth: 0 });

                if (this.refs.list.clientWidth < sumWidth) {
                    const columnsCount = Math.floor(this.refs.list.clientWidth / maxWidth);

                    this.setState({ columnsCount });
                }
            }
        });

        event.nativeEvent.stopImmediatePropagation();
    };

    close = () => {
        this.setState({ 
            isActive: false,
            focusedItemIndex: -1 
        });
    };

    render() {
        const {
            title,
            current,
            list,
            className,
            tabIndex            
        } = this.props;

        const columnsCount = this.state.columnsCount || this.props.columnsCount;

        const columns = [],
            count = Math.ceil(list.length / columnsCount);

        for (let i = 0; i < columnsCount; i++) {
            columns.push(list.slice(count * i, count * i + count));
        }

        return <div className={classNames({
                        dropdown: true,
                        [className]: className
                    })}
                    tabIndex={tabIndex}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyPressed}>

                <span className='dropdown__title'>{title}: </span>

                <span className={classNames({
                            dropdown__label: true,
                            dropdown__label_state_open: this.state.isActive
                        })}
                      onClick={this.toggle}>

                    <span>{current}</span>
                </span>

                <div className='dropdown__list'
                     ref='list'
                     style={{ display: this.state.isActive ? 'flex' : 'none' }}>

                    {columns.map((items, i) => <div className='dropdown__list-in' key={i}>
                        {items.map(item => <div className={classNames({
                                                    dropdown__item: true,
                                                    dropdown__item_state_current: item === current
                                                })}
                                                key={item}
                                                tabIndex={tabIndex}
                                                onKeyDown={this.onItemKeyPressed.bind(this, item)}
                                                onClick={this.onItemClick.bind(this, item)}>
                            <span>{item}</span>
                        </div>)}
                    </div>)}
                </div>
            </div>;
    }
}

export default Dropdown;
