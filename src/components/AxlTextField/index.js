import { Box, FormControl, FormHelperText, makeStyles, OutlinedInput, Typography } from '@material-ui/core'
import React from 'react'
import clsx from "clsx";

export const useStyles = makeStyles((theme) => ({
    typography: {
      color: '#707070',
      marginBottom: '5px'
    },
    outlinedInput: {
        fontWeight: 600,
        fontFamily: 'AvenirNext',
    },
    disabled: {
        backgroundColor: '#ededed',
        color: '#8d8d8d'
    },
    inputMultiline: {
      "&::placeholder": {
        opacity: 0.5,
        fontFamily: 'AvenirNext',
        fontWeight: 600,
        fontSize: 12,
      }
    },
    input: {
      "&::placeholder": {
        fontSize: 12,
      }
    }
}));

function AxlTextField(props) {
    const {size, label, disabled, error, helperText, ...otherProps} = props;
    const classes = useStyles();

    return (
        <FormControl size={size || 'small'} fullWidth>
            <Box>
                {label && <Typography className={classes.typography}>{label}</Typography>}
                <OutlinedInput
                    className={clsx(classes.outlinedInput, disabled && classes.disabled)}
                    disabled={disabled}
                    fullWidth
                    labelWidth={0}
                    error={error}
                    {...otherProps}
                    classes={{
                      inputMultiline: classes.inputMultiline,
                      input: classes.input
                    }}
                />
                {error && <FormHelperText error={error} style={{marginLeft: 14}}>{helperText}</FormHelperText>}
            </Box>
        </FormControl>
    )
}

export default AxlTextField