import React, { useState, useRef } from 'react';
import { Alert } from '@material-ui/lab';
import { TextareaAutosize, TextField, Radio, FormControlLabel, withStyles } from '@material-ui/core';
import { AxlButton } from 'axl-reactjs-ui';
import { cloneDeep } from 'lodash';
import colors from '../../themes/colors';

const RadioSuccess = withStyles({
  root: {
    color: '#4abc4e',
    '& $checked': {
      color: '#4abc4e',
    },
  },
})((props) => <Radio color="default" {...props} />);

const RadioFailed = withStyles({
  root: {
    color: '#d0021b',
    '& $checked': {
      color: '#d0021b',
    },
  },
})((props) => <Radio color="default" {...props} />);

const RadioPending = withStyles({
  root: {
    color: colors.orangeTwo,
    '& $checked': {
      color: colors.orangeTwo,
    },
  },
})((props) => <Radio color="default" {...props} />);

const styles = (theme) => ({
  wrapper: {
    padding: theme.spacing(1),
  },
  title: {
    display: 'block',
    color: '#979797',
    fontSize: '20px',
    fontFamily: 'AvenirNext-Bold',
    marginBottom: theme.spacing(2),
  },
  container: {
    border: '1px solid #979797',
    borderRadius: '2px',
    width: '100%',
  },
  scrollable: {
    overflow: 'auto',
    maxHeight: 'calc(100vh - 500px)',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '150px repeat(4, 200px) minmax(200px, 1fr)',
    gridTemplateRows: '60px',
    alignItems: 'center',
    borderBottom: '1px solid #979797',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(3),
    fontFamily: 'AvenirNext',

    '&:last-child': {
      borderBottom: 'none',
    },
  },
  row__title: {
    textTransform: 'uppercase',
    fontSize: '14px',

    '& > div': {
      color: '#979797',
      fontWeight: 500,
    },
  },
  success: {
    color: '#4abc4e',
  },
  failed: {
    color: '#d0021b',
  },
  pending: {
    color: colors.orangeTwo,
  },
  notice: {
    display: 'block',
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: '14px',
    color: '#979797',
    marginBottom: theme.spacing(0.5),

    '& > span': {
      fontSize: '12px',
      fontFamily: 'AvenirNext',
    },
  },
  remark: {
    margin: '16px 0',
  },
  control: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  control__right: {
    display: 'flex',
    gap: '5px',
  },
  input: {
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    fontWeight: 400,
    padding: theme.spacing(1),

    '&::placeholder': {
      fontSize: '12px',
      fontFamily: 'AvenirNext',
      fontWeight: 400,
      color: '#bfbfbf',
    },
  },
  alert: {
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    fontWeight: 400,
    marginBottom: theme.spacing(1),
  },
  empty: {
    display: 'flex',
    height: '60px',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px',
    fontFamily: 'AvenirNext'
  }
});

const STATUSES = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  NO_ACTION: '',
};

function MultipleStop(props) {
  const { classes, closeForm, assignmentStore, shipmentStore } = props;
  const { selectedAssignment } = assignmentStore;

  const data = selectedAssignment.stops.filter((stop) => stop.type === 'PICK_UP' && stop.status !== STATUSES.SUCCEEDED);
  const allStops = {};
  data.forEach((stop) => {
    allStops[stop.id] = { id: stop.id, label: stop.label && stop.label.driver_label || '-', status: stop.status, remark: stop.remark };
  });
  const originalStops = cloneDeep(allStops);

  const [checkAll, setCheckAll] = useState(null);
  const [stops, setStops] = useState(allStops);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const inputRemarkRef = useRef();
  const inputRemarksRef = useRef([]);
  inputRemarksRef.current = Array.from({ length: data.length }).map(() => useRef());

  const markAll = (e, status) => {
    if (e.target.checked === false) return setCheckAll(null);

    const tempStops = {};
    for (const stopID in stops) {
      tempStops[stopID] = { ...stops[stopID], status };
    }

    setStops(tempStops);
    setCheckAll(status);
  };

  const handleChangeStatuses = (e, id) => {
    const stop = { ...stops[id], status: e.target.value };
    const newStops = { ...stops, [id]: stop };
    const isCheckAll = Object.values(newStops).every((stop) => stop.status === e.target.value);
    if (isCheckAll) {
      setCheckAll(e.target.value);
    } else {
      setCheckAll(null);
    }

    setStops(newStops);
  };

  const handleReset = () => {
    setError('');
    setErrors({});
    setCheckAll(null);
    setStops(originalStops);

    Object.keys(originalStops).forEach((stopID, index) => {
      const stop = originalStops[stopID];
      if (inputRemarksRef.current[index]) inputRemarksRef.current[index].current.value = stop.remark || '';
    });
  };

  const handleSubmit = () => {
    let params = Object.values(stops);
    inputRemarksRef.current.forEach((inputRef) => {
      const index = params.findIndex((s) => s.id === Number(inputRef.current.name));
      if (index !== -1) params[index].remark = inputRef.current.value;
    });

    params = params.filter((stop) => stop.status !== STATUSES.NO_ACTION);
    params = params.map((stop) => ({ ...stop, remark: (stop.remark || inputRemarkRef.current.value || '').trim() }));
    params = params.filter((stop) => {
      const origin = originalStops[stop.id];
      const isChangeStatus = stop.status !== origin.status;
      const isChangeRemark = stop.remark !== origin.remark;

      if (!isChangeStatus && Boolean(origin.remark) === false && Boolean(stop.remark) === false) return false;

      return isChangeStatus || isChangeRemark;
    });

    if (params.length < 1) return closeForm();

    const errors = {};
    for (let i = 0; i < params.length; i++) {
      const stop = params[i];
      if (!stop.remark) errors[stop.id] = true;
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setError('Missing Remark parameter');
      return;
    }

    shipmentStore.updateMultiPickupStop(params, (data) => {
      closeForm();
      if (data) assignmentStore.updateStops(data);
    });
  };

  return (
    <div className={classes.wrapper}>
      <span className={classes.title}>Edit Pickup Status</span>
      {error && (
        <Alert icon={false} severity="error" classes={{ root: classes.alert }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <div className={classes.container}>
        <div className={`${classes.row} ${classes.row__title}`}>
          <div>Shipment</div>
          <FormControlLabel label={<label className={classes.success}>Succeeded</label>} control={<RadioSuccess color="default" />} checked={checkAll === STATUSES.SUCCEEDED} onChange={(e) => markAll(e, STATUSES.SUCCEEDED)} />
          <FormControlLabel label={<label className={classes.failed}>Failed</label>} control={<RadioFailed color="default" />} checked={checkAll === STATUSES.FAILED} onChange={(e) => markAll(e, STATUSES.FAILED)} />
          <FormControlLabel label={<label className={classes.pending}>Pending</label>} control={<RadioPending color="default" />} checked={checkAll === STATUSES.PENDING} onChange={(e) => markAll(e, STATUSES.PENDING)} />
          <FormControlLabel label="No Action" control={<Radio color="default" />} checked={checkAll === STATUSES.NO_ACTION} onChange={(e) => markAll(e, STATUSES.NO_ACTION)} />
          <div>Remark</div>
        </div>
        <div className={classes.scrollable}>
          {Object.values(stops).length === 0 && <div className={classes.empty}>Empty data</div>}
          {Object.values(stops).map((stop, index) => (
            <div className={classes.row} key={stop.id}>
              <div>{stop.label}</div>
              <FormControlLabel label={<label className={classes.success}>Succeeded</label>} control={<RadioSuccess color="default" />} checked={stop['status'] === STATUSES.SUCCEEDED} value={STATUSES.SUCCEEDED} onChange={(e) => handleChangeStatuses(e, stop.id)} />
              <FormControlLabel label={<label className={classes.failed}>Failed</label>} control={<RadioFailed color="default" />} checked={stop['status'] === STATUSES.FAILED} value={STATUSES.FAILED} onChange={(e) => handleChangeStatuses(e, stop.id)} />
              <FormControlLabel label={<label className={classes.pending}>Pending</label>} control={<RadioPending color="default" />} checked={stop['status'] === STATUSES.PENDING} value={STATUSES.PENDING} onChange={(e) => handleChangeStatuses(e, stop.id)} />
              <FormControlLabel label="No Action" control={<Radio color="default" />} checked={stop['status'] === STATUSES.NO_ACTION} value={STATUSES.NO_ACTION} onChange={(e) => handleChangeStatuses(e, stop.id)} />
              <TextField type="text" variant="outlined" size="small" fullWidth placeholder="Enter remark..." defaultValue={stop.remark} error={Boolean(errors[stop.id])} inputProps={{ className: classes.input, name: stop.id }} inputRef={inputRemarksRef.current[index]} />
            </div>
          ))}
        </div>
      </div>
      <div className={classes.remark}>
        <span className={classes.notice}>
          Remark <span>(Apply for stops which empty remark)</span>
        </span>
        <TextareaAutosize minRows={5} ref={inputRemarkRef} placeholder="Enter remark for multiple stops..." style={{ width: 'calc(100% - 18px)', resize: 'vertical', padding: '8px' }} />
      </div>
      <div className={classes.control}>
        <div className={classes.control__left}>
          <AxlButton compact bg="gray" style={{ width: '100px' }} onClick={handleReset}>
            RESET
          </AxlButton>
        </div>
        <div className={classes.control__right}>
          <AxlButton compact bg="gray" style={{ width: '100px' }} onClick={closeForm}>
            CANCEL
          </AxlButton>
          <AxlButton compact style={{ width: '100px' }} onClick={handleSubmit}>
            OK
          </AxlButton>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(MultipleStop);
