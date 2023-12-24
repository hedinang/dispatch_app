import React, { Component } from 'react';
import { ThemeProvider } from 'styled-components';
import { Input, Clear, Container, Contain, DropDown, DropDownIcon, DropDownItem, DropDownContainer, Checkbox, DropDownInner, TagContainer, Text }  from './styles';
import tagIcon from '../../images/svg/tag-icon.svg';
import tagIconHover from '../../images/svg/tag-icon-hover.svg';
import { DRIVER_TAGS } from '../../constants/assignment';

// Component
import AxlTags from '../AxlTags';

class AxlSearchBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: '',
            tags: [],
            checkboxStatus: {}
        }
        this.onClear = this.onClear.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onChange = this.onChange.bind(this);
        this.clearValue = this.clearValue.bind(this);
        this.onClearAllTags = this.onClearAllTags.bind(this);
    }

    onKeyUp(event) {
        this.props.onEnter && event.key === 'Enter' && this.props.onEnter(event)
        this.props.onKeyPress && this.onKeyPress(event)
    }

    clearValue() {
        this.setState({value: ''});
        this.props.onChange('');
        this.props.onEnter && this.props.onEnter({target: {value: ''}});
    }

    onChange(e) {
        this.props.onChange(e.target.value);
        this.setState({value: e.target.value});
    }

    componentDidMount() {
        if(this.props.defaultValue) {
            this.props.onChange(this.props.defaultValue);
        }
        this.setState({value: this.props.defaultValue ? this.props.defaultValue : ''})
    }

    onUpdate(value) {
        let _tags = [];
        if(value) {
            const _values = Object.keys(value).map(v => value[parseInt(v)] && parseInt(v)).filter(v => v !== false);
            _tags = _values.map(v => this.props.tags[v]);
            this.setState({tags: _tags});
            this.props.onTagSelect(_values.map(v => this.props.tags[v] && this.props.tags[v].value));
        }
    }

    onClear(value) {
        let _tags = [];
        const { tags } = this.state;
        if(value !== undefined || value !== '') {
            _tags = tags.filter(tag => tag.value !== value);
            
            // clear drop tag
            let clearDropTagIndex = null
            for (let i = 0; i < this.props.tags.length; i++) {
                if (this.props.tags[i] && (this.props.tags[i].value == value)) {
                    clearDropTagIndex = i
                    break
                }
            }
            
            if (clearDropTagIndex != null) {
                const checkboxStatus = Object.assign(this.state.checkboxStatus, {[clearDropTagIndex]: !this.state.checkboxStatus[clearDropTagIndex]});
                this.setState({tags: _tags, checkboxStatus: checkboxStatus});
            }
            
            this.props.onTagSelect(_tags.map(t => t.value));
        }
    }

    onClearAllTags() {
        this.setState({tags: [], checkboxStatus: {}});
        this.props.onTagSelect([]);
    };

    render() {
        return <ThemeProvider theme={{type: this.props.theme ? this.props.theme : 'default'}}>
            <Contain>
                <Container>
                    { this.props.tags && this.props.tags.length > 0 && <DropdownTags tags={this.props.tags} onUpdate={this.onUpdate} checkboxStatus={this.state.checkboxStatus} /> }
                    <Input
                        value={this.state.value}
                        placeholder={this.props.placeholder}
                        onChange={ this.onChange }
                        onKeyUp={ this.onKeyUp }
                        style={this.props.style} />
                    <Clear onClick={this.clearValue} />
                </Container>
                { this.state.tags.length > 0 && <TagContainer>
                    <AxlTags tags={this.state.tags} onClear={this.onClear} onClearAllTags={this.onClearAllTags} />
                </TagContainer> }
            </Contain>
        </ThemeProvider>
    }
}

export default AxlSearchBox

class DropdownTags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            checkboxStatus: this.props.checkboxStatus || {}
        };
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick = (value) => {
        const checkboxStatus = Object.assign(this.state.checkboxStatus, {[value]: !this.state.checkboxStatus[value]});
        this.setState({checkboxStatus: checkboxStatus});
        this.props.onUpdate(checkboxStatus);
    }

    toggleDropdown() {
        this.setState({open: !this.state.open});
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.checkboxStatus !== nextProps.checkboxStatus) {
            this.setState({checkboxStatus: nextProps.checkboxStatus})
        }
    }

    render() {
        const { checkboxStatus } = this.state;
        const tagIconImage = Object.keys(checkboxStatus).length > 0 && Object.values(checkboxStatus).filter(s => s).length > 0 ? tagIconHover : tagIcon;

        return this.props.tags ? <DropDown>
            <DropDownIcon src={tagIconImage} onClick={this.toggleDropdown} />
            {this.state.open && <DropDownContainer>
                <DropDownInner>
                    {this.props.tags.map((tag, index) => {
                        return <DropDownItem key={index} className={this.props.tags.length === (index + 1) ? 'last' : ''} onClick={() => this.handleClick(index)}>
                        <Checkbox value={tag.value} className={!!this.state.checkboxStatus[index] ? 'checked' : ''} />
                        <Text>{React.cloneElement(tag.text)}</Text>
                    </DropDownItem>
                    })}
                </DropDownInner>
            </DropDownContainer>}
        </DropDown> : null;
    }
}
