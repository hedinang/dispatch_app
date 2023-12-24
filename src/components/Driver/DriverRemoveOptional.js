import React, { Fragment } from 'react';
import { FormControlLabel, Checkbox, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  notice: {
    fontFamily: 'AvenirNext',
    fontSize: '16px',
    color: '#979797',
    fontWeight: 500,
  },
  label: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '500px',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
  },
  empty: {
    color: '#979797',
    fontFamily: 'AvenirNext',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkAllLabel: {
    fontSize: '16px',
    color: '#6c62f5',
    fontFamily: 'AvenirNext-DemiBold',
  },
  checkboxContainer: {
    paddingLeft: '15px',
  },
}));

function Label({ name }) {
  const classes = useStyles();

  return <label className={classes.label}>{name}</label>;
}

function DriverRemoveOptional({ crews, bookingSessions, schedules, handleChange }) {
  const classes = useStyles();

  return (
    <Fragment>
      <p className={classes.notice}>Also remove driver from below driver crews, booking sessions and driver route schedules</p>
      <span className={classes.checkAllLabel}>Driver Crews</span>
      <div className={classes.checkboxContainer}>
        {crews.map((crew) => (
          <FormControlLabel key={crew.id} classes={{ root: classes.root }} control={<Checkbox checked={crew.checked} name={crew.id} onChange={(event) => handleChange('crew', event)} />} label={<Label name={crew.name} />} />
        ))}
      </div>
      {crews.length === 0 && <span className={classes.empty}>Empty data</span>}
      <span className={classes.checkAllLabel}>Booking Sessions</span>
      <div className={classes.checkboxContainer}>
        {bookingSessions.map((session) => (
          <FormControlLabel key={session.id} classes={{ root: classes.root }} control={<Checkbox checked={session.checked} name={session.id} onChange={(event) => handleChange('session', event)} />} label={<Label name={session.name} />} />
        ))}
      </div>
      {bookingSessions.length === 0 && <span className={classes.empty}>Empty data</span>}
      <span className={classes.checkAllLabel}>Driver Route Schedules</span>
      <div className={classes.checkboxContainer}>
        {schedules.map((schedule) => (
          <FormControlLabel key={schedule.id} classes={{ root: classes.root }} control={<Checkbox checked={schedule.checked} name={schedule.id} onChange={(event) => handleChange('schedule', event)} />} label={<Label name={schedule.name} />} />
        ))}
      </div>
      {schedules.length === 0 && <span className={classes.empty}>Empty data</span>}
    </Fragment>
  );
}

export default DriverRemoveOptional;
