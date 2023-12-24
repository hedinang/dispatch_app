import { Box, FormControl, makeStyles, TextField, Typography } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab';
import React from 'react'
import clsx from "clsx";

export const useStyles = makeStyles((theme) => ({
  typography: {
    color: '#707070',
    marginBottom: '5px',
  },
  inputRoot: {
    fontWeight: '600 !important',
    fontFamily: 'AvenirNext !important',
  },
  disabled: {
    backgroundColor: '#ededed',
    color: '#4a4a4a',
    fontWeight: 600,
  },
  popper:{
    zIndex: 100000,
  },
  inputProps: {
    "&::placeholder": {
      fontSize: 12,
      fontFamily: 'AvenirNext',
    }
  }
}));

function AxlAutocomplete(props) {
  const classes = useStyles();
  let {options, error, helperText, isPopper = false, placeholder, ...otherProps} = props;
  if(!options || options.length == 0) options = [];

  return (
    <FormControl fullWidth>
      <Box>
        {props.label && <Typography className={classes.typography}>{props.label}</Typography>}
        <Autocomplete 
            renderInput={(params) => (
              <TextField 
                {...params} 
                variant={props.variant || 'outlined'} 
                className={clsx(props.disabled && classes.disabled)} 
                error={error} 
                helperText={helperText}
                placeholder={placeholder}
                InputProps={{
                  ...params.InputProps,
                  classes: {
                    input: classes.inputProps
                  }
                }}
              />
            )} 
            classes={{inputRoot: classes.inputRoot, popper: isPopper && classes.popper}}
            options={options}
            size={props.size || 'small'}
            {...otherProps}
        />
      </Box>
    </FormControl>
  )
}

export default AxlAutocomplete
