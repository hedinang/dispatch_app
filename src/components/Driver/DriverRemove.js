import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Alert } from '@material-ui/lab';
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, makeStyles } from '@material-ui/core';
import { AxlButton } from 'axl-reactjs-ui';

import DriverRemoveReason from './DriverRemoveReason';
import DriverRemoveOptional from './DriverRemoveOptional';

import { getDriverCrewsAndBookingSessions, removeDriver } from '../../stores/api';

const useStyles = makeStyles((theme) => ({
  loading: {
    display: 'flex',
    width: '100%',
    minHeight: '300px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    fontWeight: 400,
    marginBottom: theme.spacing(1),
  },
}));

function DriverRemove({ driver, driverCrew, open, onSuccess, onClose }) {
  const inputRef = useRef();
  const classes = useStyles();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reason, setReason] = useState('');
  const [crews, setCrews] = useState([]);
  const [bookingSessions, setBookingSessions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(true);

  const handleChange = (type, e) => {
    const id = e.target.name;
    const checked = e.target.checked;

    if (type === 'crew') {
      const newCrews = crews.map((crew) => (crew.id !== id ? { ...crew } : { ...crew, checked }));
      setCrews(newCrews);
    }

    if (type === 'session') {
      const newBookingSessions = bookingSessions.map((session) => (session.id !== id ? { ...session } : { ...session, checked }));
      setBookingSessions(newBookingSessions);
    }

    if (type === 'schedule') {
      const newSchedules = schedules.map((schedule) => (schedule.id !== id ? { ...schedule } : { ...schedule, checked }));
      setSchedules(newSchedules);
    }
  };

  const handleClose = () => onClose();

  const handleSelectedOptions = () => {
    const driverCrewIDs = crews.filter((crew) => crew.checked).map((crew) => crew.id);
    const bookingIDs = bookingSessions.filter((session) => session.checked).map((session) => session.id);
    const routeScheduleIDs = schedules.filter((schedule) => schedule.checked).map((schedule) => schedule.id);

    const selectedOptions = driverCrewIDs.length + bookingIDs.length + routeScheduleIDs.length;

    return { selectedOptions, driverCrewIDs, bookingIDs, routeScheduleIDs };
  };

  const handleSubmit = async () => {
    const { selectedOptions, driverCrewIDs, bookingIDs, routeScheduleIDs } = handleSelectedOptions();

    if (reason.trim() === '') {
      setError('Reason is required');
      inputRef.current.focus();
      return;
    }

    if (selectedOptions === 0) return setError('Required at least 1 option');

    setSubmitting(true);
    const params = { reason };
    const data = {
      driver_crews: driverCrewIDs,
      booking_sessions: bookingIDs,
      driver_route_schedules: routeScheduleIDs,
    };

    await removeDriver(driver.id, params, data);

    setSubmitting(false);
    onSuccess();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDriverCrewsAndBookingSessions(driver.id);
        const { data } = response;
        setLoading(false);
        setCrews(data.driver_crews.map((crew) => ({ ...crew, checked: crew.region && crew.region === driverCrew.region })));
        setBookingSessions(data.booking_sessions.map((session) => ({ ...session, checked: session.region && session.region.includes(driverCrew.region) })));
        setSchedules(data.driver_route_schedules.map((schedule) => ({ ...schedule, checked: schedule.region && schedule.region.includes(driverCrew.region) })));
      } catch (error) {
        setLoading(false);
        setError(error.message || error.toString());
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const { selectedOptions } = handleSelectedOptions();
    setDisableSubmit(selectedOptions === 0 || reason.trim() === '');
  }, [crews, bookingSessions, schedules, reason]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{`Confirm remove driver [${driver.id}] ${driver.first_name} ${driver.last_name}`}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert icon={false} severity="error" classes={{ root: classes.alert }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {loading ? (
          <div className={classes.loading}>
            <CircularProgress />
          </div>
        ) : (
          <Fragment>
            <DriverRemoveReason ref={inputRef} reason={reason} setReason={setReason} />
            <DriverRemoveOptional crews={crews} bookingSessions={bookingSessions} schedules={schedules} handleChange={handleChange} />
          </Fragment>
        )}
      </DialogContent>
      <DialogActions>
        <AxlButton compact onClick={handleClose} bg="gray" style={{ width: '100px' }}>
          CANCEL
        </AxlButton>
        <AxlButton compact onClick={handleSubmit} bg="pink" disabled={loading || submitting || disableSubmit} style={{ width: '100px' }}>
          CONFIRM
        </AxlButton>
      </DialogActions>
    </Dialog>
  );
}

export default DriverRemove;
