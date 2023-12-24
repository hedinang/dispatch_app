import React, { Fragment } from 'react';
import { TextField, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  label: {
    display: 'block',
    fontSize: '16px',
    color: '#979797',
    fontFamily: 'AvenirNext',
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  required: {
    color: 'red',
    fontWeight: 400,
  },
}));

function DriverRemoveReason(props, ref) {
  const classes = useStyles();
  const { reason, setReason } = props;

  return (
    <Fragment>
      <label htmlFor="reason" className={classes.label}>
        Reason (<span className={classes.required}>*</span>)
      </label>
      <TextField value={reason} onChange={(e) => setReason(e.target.value)} inputRef={ref} id="reason" name="reason" variant="outlined" fullWidth minRows={4} multiline />
    </Fragment>
  );
}

export default React.forwardRef(DriverRemoveReason);
