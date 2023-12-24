import React, { useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { compose } from 'recompose';
import { inject, observer } from 'mobx-react';
import { Box, TextField, FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  communication: {
    fontFamily: 'monospace',
  },
});

function CreateBookingSessionForm(props) {
  const classes = useStyles();

  const { bookingStore } = props;
  const { bookingSessionFormData, activeSession } = bookingStore;

  const { name, communication, is_remove_assignment } = bookingSessionFormData;

  const handleChange = (event) => {
    const field = event.target.name;
    const value = event.target.value;

    bookingStore.setBookingSessionFormData(field, value);
  };

  const handleChangeCheckbox = (event) => {
    const field = event.target.name;
    const checked = event.target.checked;

    bookingStore.setBookingSessionFormData(field, checked);
  };

  useEffect(() => {
    const targetDate = moment(_.get(activeSession, 'session.target_date'));

    bookingStore.setBookingSessionFormData('name', `Routes for ${targetDate.format('YYYY-MM-DD')}`);
  }, [activeSession]);

  return (
    <Box className={classes.container}>
      <TextField label="Name" name="name" variant="outlined" size="small" fullWidth value={name} onChange={handleChange} />
      <TextField label="Communication" name="communication" fullWidth variant="outlined" size="small" multiline minRows={10} value={communication} onChange={handleChange} inputProps={{ className: classes.communication }} />
      <FormControlLabel label="Remove assignments in ticket booking" control={<Checkbox name="is_remove_assignment" checked={is_remove_assignment} onChange={handleChangeCheckbox} />} />
    </Box>
  );
}

export default compose(inject('bookingStore'), observer)(CreateBookingSessionForm);
