import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';

function InputNumber({label, value, variant, name, handleChange, fullWidth, isAcceptNegative, isDecimal, tabIndex, type, min}) {
    const labelSplits = label.split(' ') || [];

    const nameDefault = name ? name : lowerCaseFirstLetter(labelSplits.join(''));

    function lowerCaseFirstLetter(str) {
        return str[0].toLowerCase() + str.slice(1)
    }

    const handleOnKeyDown = (e) => {
        if(e.keyCode === 9 || (e.keyCode >= 37 && e.keyCode <= 40)) {
            return true;
        }
        // minus sign
        if(e.keyCode === 173) {
            if(isAcceptNegative) {
                if([...e.target.value].length === 0) {
                    return true;
                }
                
                if([...e.target.value][0] === '-' || !isNaN(e.target.value)) {
                  e.preventDefault()
                  return false;
                }

                return true;
            }
        }

        // dot sign
        if(isDecimal) {
            if(e.keyCode === 190) {
                if([...e.target.value].length === 0) {
                    return true;
                }
               
                if(/(\d+)?(\.)(\d+)?/.test(e.target.value)) {
                    e.preventDefault()
                    return false;
                }
                return true;
            }
        }

        if(!((e.keyCode > 95 && e.keyCode < 106)
          || (e.keyCode > 47 && e.keyCode < 58) 
          || e.keyCode == 8)) {
            e.preventDefault()
            return false;
        }
    }

    return (
        <TextField 
            id={labelSplits.join('-').toLowerCase()}
            label={label}
            variant={variant}
            value={value} 
            type={type} 
            fullWidth={fullWidth}
            onChange={handleChange}
            name={nameDefault}
            onKeyDown={handleOnKeyDown}
            inputProps={{tabIndex}}
            InputProps={type === 'number' && {
                inputProps: { 
                    min
                }
            }}
        />
    )
}

InputNumber.defaultProps = {
    label: '',
    variant: 'standard',
    fullWidth: true,
    isAcceptNegative: false,
    isDecimal: true,
    type: 'text',
    min: 0,
}

InputNumber.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.oneOf([null])
    ]).isRequired,
    variant: PropTypes.oneOf(['outlined', 'filled', 'standard']), 
    name: PropTypes.string, 
    handleChange: PropTypes.func.isRequired, 
    fullWidth: PropTypes.bool,
    isAcceptNegative: PropTypes.bool,
    isDecimal: PropTypes.bool,
    tabIndex: PropTypes.number,
    type: PropTypes.string,
    min: PropTypes.number,
}

export default InputNumber
