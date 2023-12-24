import React, { useState } from 'react';
import { withStyles } from '@material-ui/core';
import { AxlReselect, AxlInput, AxlDateInput, AxlButton } from 'axl-reactjs-ui';

const styles = (theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  title: {
    fontSize: '20px',
    fontFamily: 'AvenirNext-Bold',
    color: '#979797',
    display: 'block',
    marginBottom: theme.spacing(3),
  },
  container: {
    minWidth: '400px',

    '& > div:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
  label: {
    color: '#979797',
    fontSize: '14px',
    fontFamily: 'AvenirNext-DemiBold',
    display: 'block',
    marginBottom: theme.spacing(1),
  },
  action: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
});

const STATUSES = [
  { label: 'PENDING', value: 'PENDING', color: '#fa6725' },
  { label: 'SUCCEEDED', value: 'SUCCEEDED', color: '#4abc4e' },
  { label: 'FAILED', value: 'FAILED', color: '#d63031' },
];

function SingleStop(props) {
  const { classes, closeForm, pickup, shipmentStore } = props;
  const pickupStatus = STATUSES.find((s) => s.value === pickup.status);

  const [status, setStatus] = useState(pickupStatus || null);
  const [remark, setRemark] = useState(pickup.remark || '');
  const [pickupTime, setPickupTime] = useState(pickup.actual_departure_ts || new Date());

  const options = {
    dateFormat: 'MMM DD, Y HH:mm:SS A',
    placeHolder: 'Pickup Time',
    enableTime: true,
    altInput: true,
    clickOpens: true,
    defaultValue: pickupTime,
  };

  const handleSubmit = () => {
    if (remark.trim() === '') return;

    const param = { id: pickup.id, status: status ? status.value : undefined, remark, actual_departure_ts: pickupTime };

    shipmentStore.updatePickupStop(param, closeForm);
  };

  return (
    <div className={classes.root}>
      <span className={classes.title}>Edit Pickup Status</span>
      <div className={classes.container}>
        <div>
          <label htmlFor="status" className={classes.label}>
            Pickup Status
          </label>
          <AxlReselect id="status" value={status} options={STATUSES} placeholder="Pickup Status" name="status" theme="main" onChange={(option) => setStatus(option)} />
        </div>
        <div>
          <label htmlFor="pickupTime" className={classes.label}>
            Pickup Time
          </label>
          <AxlDateInput id="pickupTime" value={pickupTime} displayToday={false} theme="main" options={options} onChange={(date) => setPickupTime(date)} />
        </div>
        <div>
          <label htmlFor="remark" className={classes.label}>
            Remark
          </label>
          <AxlInput type="text" name="remark" placeholder="Remark" fluid value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>
        <div className={classes.action}>
          <AxlButton compact bg="gray" type="button" style={{ width: '100%' }} onClick={closeForm}>
            CANCEL
          </AxlButton>
          <AxlButton compact type="button" style={{ width: '100%' }} disabled={remark.trim() === ''} onClick={handleSubmit}>
            SAVE
          </AxlButton>
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(SingleStop);
