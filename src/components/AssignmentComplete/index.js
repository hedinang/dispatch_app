import React, { useState } from 'react';
import { get } from 'lodash';
import { AxlButton } from 'axl-reactjs-ui';
import { Dialog, DialogContent, DialogActions, makeStyles } from '@material-ui/core';

import api from '../../stores/api';

const useStyles = makeStyles({
  title: {
    color: '#4a4a4a',
    fontSize: '22px',
    textAlign: 'center',
    fontFamily: 'AvenirNext-Medium',
  },
  text: {
    color: '#bfbfbf',
    textAlign: 'center',
    fontFamily: 'AvenirNext',
  },
  actions: {
    justifyContent: 'center',
  },
  btn: {
    minWidth: '120px',
  },
});

function AssignmentComplete({ onOk, onCancel, assignmentID }) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const openDialog = async () => {
    const response = await api.get(`assignments/${assignmentID}/can_complete`);
    const canComplete = get(response, 'data.can_complete') === true;

    if (canComplete && typeof onOk === 'function') return onOk();

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (typeof onCancel === 'function') onCancel();
  };

  const handleConfirm = () => {
    handleClose();
    if (typeof onOk === 'function') onOk();
  };

  return (
    <React.Fragment>
      <AxlButton tiny={true} compact={true} onClick={openDialog}>
        Complete
      </AxlButton>
      <Dialog open={open} onClose={handleClose} maxWidth="lg">
        <DialogContent>
          <h2 className={classes.title}>Complete Route</h2>
          <p className={classes.text}>There is at least one shipment that has delivery failed but has not been returned, are you sure you want to complete this route?</p>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <AxlButton tiny bg="gray" style={{ minWidth: 120, padding: '0 15px' }} onClick={handleClose}>
            NO
          </AxlButton>
          <AxlButton tiny bg="pink" style={{ minWidth: 120, padding: '0 15px' }} onClick={handleConfirm}>
            OK
          </AxlButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default AssignmentComplete;
