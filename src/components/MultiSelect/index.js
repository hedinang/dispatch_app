import React, { Component } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import Select, { components } from 'react-select';
import _ from 'lodash';
import PropTypes from 'prop-types';

// Styles
import styles, * as E from './styles';

export default function AxlMultiSelect({defaulValue, options, singular, onChange, isClearable, isSearchable, style, placeholderButtonLabel, placeholder, allowAll, theme, customStyle, showValues}) {

  const handleOnChange = (value) => {
    if (singular) {
      if (!value || value.length < 1) {
        if (!allowAll) return;
      }
      else if (value.length > 1) {
        // check for new
        let old = defaulValue ? defaulValue.map(v => v.value) : []
        let newlySelected = value.filter(v => old.indexOf(v.value) < 0)
        onChange && onChange(newlySelected)
        return
      }
    }
    onChange && onChange(value)
  }

  const buttonLabel = (vals) => {
    const placeholderButtonLabel = vals.placeholderButtonLabel,
        value = vals.value;

    if (!value) {
      return placeholderButtonLabel;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return placeholderButtonLabel;
      }

      if (showValues)
        return value.map(v => v.label).join(', ')

      if (value.length === 1) {
        return value[0].label;
      }

      return "".concat(value.length, " selected");
    }

    return value.label;
  }

  const clearValue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange && onChange([])
  }

    const isClear = _.indexOf(['primary'], theme) === -1;
    const menuList = customStyle && customStyle.menuList || [];
    const customStyles = {
      container: () => styles[theme].container,
      dropdownButton: () => styles[theme].dropdownButton,
      option: () => styles[theme].option,
      control: () => styles[theme].control,
      singleValue: () => styles[theme].singleValue,
      valueContainer: () => styles[theme].valueContainer,
      menuList: () => [styles[theme].menuList, menuList],
      input: () => styles[theme].input,
      indicatorsContainer: () => styles[theme].indicatorsContainer,
      indicatorSeparator: () => styles[theme].indicatorSeparator,
      dropdownIndicator: () => styles[theme].dropdownIndicator,
      placeholder: () => styles[theme].placeholder
    }

    const SelectContainer = ({ children, ...props }) => {
      return (
        <components.SelectContainer {...props}>
          {children}
        </components.SelectContainer>
      );
    };

    const ControlComponent = props => {
      return isSearchable ? <E.Controler>
        <components.Control {...props} />
      </E.Controler> : null
    }

    const Option = ({ children, ...props }) => (
      <components.Option {...props}>
        <E.Label><E.Checkbox className={props.isSelected ? 'checked' : ''} />{children}</E.Label>
      </components.Option>
    );

    const IndicatorsContainer = props => {
      return (
        <E.IndicatorsContainer>
          <components.IndicatorsContainer {...props} />
        </E.IndicatorsContainer>
      );
    };

    const DropdownButtonIcon = () => {
      return <E.DropdownIconContainer>
        {!isClear && <E.ClearSearch onClick={clearValue}><i className="fa fa-times" /></E.ClearSearch>}
        <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
          <path d="M8.292 10.293a1.009 1.009 0 0 0 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955a1.01 1.01 0 0 0 0-1.419.987.987 0 0 0-1.406 0l-2.298 2.317-2.307-2.327a.99.99 0 0 0-1.406 0z" fill="currentColor" fillRule="evenodd"></path>
        </svg>
      </E.DropdownIconContainer>
    };

    const ClearIndicator = props => {
      const {
        children = <E.ClearSearch onClick={clearValue}><i className="fa fa-times" /></E.ClearSearch>,
        getStyles,
        innerProps: { ref, ...restInnerProps },
      } = props;
      return (
        <E.ClearIndicator
          {...restInnerProps}
          ref={ref}
        >{children}</E.ClearIndicator>
      );
    };

    const selectComponents = {
      Option, ClearIndicator, SelectContainer, DropdownButtonIcon, IndicatorsContainer,
      Control: ControlComponent
    };

    return <E.Container style={style}>
      <ReactMultiSelectCheckboxes
        isClearable={isClearable}
        isSearchable={isSearchable}
        components={selectComponents}
        styles={customStyles}
        getDropdownButtonLabel={buttonLabel}
        value={defaulValue}
        onChange={value => handleOnChange(value)}
        placeholder={placeholder}
        placeholderButtonLabel={placeholderButtonLabel}
        options={options} />
      { isClear && <E.ClearIcon onClick={clearValue} style={styles.clearIcon}><i className="fa fa-times" /></E.ClearIcon> }
    </E.Container>
}

AxlMultiSelect.defaultProps = {
  theme: 'default',
  isClearable: false,
  isSearchable: true
}

AxlMultiSelect.propTypes = {
  theme: PropTypes.string,
  isClearable: PropTypes.bool,
  isSearchable: PropTypes.bool
}
