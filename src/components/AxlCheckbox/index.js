import React from 'react';

import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  flexColumn: {
    flexDirection: 'column',
  },
  flexRow: {
    flexDirection: 'row',
  },
}));

function AxlCheckbox({required, handleChange, label, checkboxes, helperText, error = false, isVertical = true }) {

  if (!checkboxes || checkboxes.length === 0) return null;
  const classes = useStyles();

  return (
    <FormControl required={required} error={error} component="fieldset">
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <FormGroup classes={{root: isVertical ? classes.flexColumn : classes.flexRow}}>
        {checkboxes.map(checkbox => (
          <FormControlLabel
            control={<Checkbox checked={checkbox.checked} onChange={handleChange} name={checkbox.name} />}
            label={checkbox.label}
            key={checkbox.name}
          />
        ))}
      </FormGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default AxlCheckbox