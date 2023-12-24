import { Box, FormControl, FormHelperText, makeStyles, MenuItem, Select, Typography } from '@material-ui/core'
import React from 'react'
import clsx from "clsx";

export const useStyles = makeStyles((theme) => ({
    typography: {
      color: '#707070',
      marginBottom: '5px'
    },

    disabled: {
        backgroundColor: '#ededed',
        color: '#4a4a4a',
        fontWeight: 600,
    }
}));

function AxlSelect(props) {
    const classes = useStyles();
    let {options, size, variant, label, disabled, error, helperText, ...otherProps} = props;
    if(!options || options.length == 0 ) options = [];

    return (
        <FormControl variant={variant || "outlined"} size={size || 'small'} fullWidth error={error}>
            <Box>
                {label && <Typography className={classes.typography}>{label}</Typography>}
                <Select
                    className={clsx(classes.select, disabled && classes.disabled)}
                    fullWidth
                    disabled={disabled}
                    {...otherProps}
                >
                    {options.map((item, idx) => (
                        <MenuItem value={item.value} key={idx}>{item.label}</MenuItem>
                    ))}
                </Select>
                <FormHelperText>{helperText}</FormHelperText>
            </Box>
        </FormControl>
    )
}

export default AxlSelect