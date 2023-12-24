import { Button, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  label: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

function AxlButtonIcon({ label, variant, color, endIcon, size, style, handleClick }) {
  const classes = useStyles();
  return (
    <Button variant={variant || 'outlined'} color={color || 'primary'} endIcon={React.isValidElement(endIcon) ? endIcon : null} fullWidth classes={{ label: classes.label }} size={size || 'medium'} style={style} onClick={handleClick}>
      {label}
    </Button>
  );
}

export default AxlButtonIcon;
