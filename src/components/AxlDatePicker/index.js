import React, { Fragment, useState } from 'react';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Typography, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export const useStyles = makeStyles((theme) => ({
    input: {
      fontWeight: 600,
    },
    disabled: {
        backgroundColor: '#ededed',
        color: '#8d8d8d'
    },
    typography: {
        color: '#707070',
        marginBottom: '5px'
    },
}));

function AxlDatePicker(props) {
    const classes = useStyles();
    const {label, disabled, ...otherProps} = props;
    const [open, setOpen] = useState(false);
    
    return (
        <Fragment>
            {label && <Typography className={classes.typography}>{label}</Typography>}
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker 
                    className={clsx(disabled && classes.disabled)}
                    variant={props.variant || 'inline'} 
                    inputVariant={props.inputVariant || 'outlined'} 
                    autoOk
                    fullWidth
                    InputProps={{
                        className: classes.input,
                        readOnly: true
                    }}
                    size={props.size || 'small'}
                    disabled={disabled}
                    {...otherProps}
                    open={open}
                    onClick={() => { if(!disabled) setOpen(true) }}
                    onClose={() => setOpen(false)}
                />
            </MuiPickersUtilsProvider>
        </Fragment>
  );
}

export default AxlDatePicker;
