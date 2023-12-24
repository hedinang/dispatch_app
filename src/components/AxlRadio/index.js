import React from 'react';

import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  flexColumn: {
    flexDirection: 'column',
  },
  flexRow: {
    flexDirection: 'row',
  },
}));

function AxlRadio({label, selectedValue, handleChange, dataRadio, isVertical = true}) {
  const classes = useStyles();

  return (
    <FormControl component="fieldset">
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup aria-label="gender" name="gender1" value={selectedValue} onChange={handleChange} classes={{root: isVertical ? classes.flexColumn : classes.flexRow}}>
        {dataRadio && dataRadio.map((radio, idx) => {
          const { label, value, ...otherProps } = radio;
          return <FormControlLabel value={value} control={<Radio />} label={label} key={`${label}-${idx}`} {...otherProps}/>
        }
        )}
      </RadioGroup>
    </FormControl>
  )
}

export default AxlRadio