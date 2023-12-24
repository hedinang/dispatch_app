import React from 'react';
import { Tooltip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    fontSize: '10px',
  },
});

function TooltipContainer({ children, title = '', wrapped = true, ...rest }) {
  const classes = useStyles();

  return (
    <Tooltip title={title} arrow classes={{ tooltip: classes.root }} {...rest}>
      {wrapped ? <div style={{ display: 'unset' }}>{children}</div> : children}
    </Tooltip>
  );
}

export default TooltipContainer;
