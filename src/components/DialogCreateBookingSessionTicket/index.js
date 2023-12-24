import React, { useState } from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepButton, CircularProgress, makeStyles } from '@material-ui/core';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import TicketBookList from './TicketBookList';
import CreateBookingSessionForm from './CreateBookingSessionForm';

const STEPS = ['Select assignments', 'More information'];

const useStyles = makeStyles({
  actions: {
    paddingTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
  },
  nextBtn: {
    marginLeft: 'auto',
  },
  submitBtn: {
    minWidth: '80px',
    height: '32px',
  },
});

function DialogCreateBookingSessionTicket(props) {
  const classes = useStyles();
  const history = useHistory();
  const { open = false, onClose, bookingStore } = props;

  const { selectedAssignmentIds, bookingSessionFormData, activeSession } = bookingStore;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const disableNext = selectedAssignmentIds.length === 0;

  const handleClose = () => {
    setActiveStep(0);
    bookingStore.cleanupBookingSessionFormState();
    if (typeof onClose === 'function') onClose();
  };

  const handleStep = (step) => {
    setActiveStep(step);
  };

  const handleNext = (inc) => {
    setActiveStep(activeStep + inc);
  };

  const handleSubmit = () => {
    if (selectedAssignmentIds.length === 0) return;

    setLoading(true);
    const { name, communication, is_remove_assignment } = bookingSessionFormData;
    const data = { name, communication, attributes: { booking_session_id: activeSession.session.id, is_remove_assignment }, target_assignments: selectedAssignmentIds };
    bookingStore.createBookingSession(data).then((response) => {
      setLoading(false);
      if (response.status !== 200) return toast.error(_.get(response, 'data.message', 'Something went wrong!'), { toastId: 'main' });

      bookingStore.refreshSession();
      bookingStore.cleanupBookingSessionFormState();
      const scheduleId = response.data;
      history.push(`/schedule/${scheduleId}`);
    });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <TicketBookList />;
      case 1:
        return <CreateBookingSessionForm />;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle style={{ textAlign: 'center' }}>CREATE DIRECT BOOKING</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '50%', margin: '0 auto' }}>
          <Stepper activeStep={activeStep}>
            {STEPS.map((step, index) => (
              <Step key={step}>
                <StepButton onClick={() => handleStep(index)}>{step}</StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
        {renderStep()}
        <Box className={classes.actions}>
          {activeStep > 0 && (
            <Button startIcon={<KeyboardArrowLeftIcon fontSize="large" />} color="inherit" variant="text" disabled={activeStep === 0} onClick={() => handleNext(-1)}>
              BACK
            </Button>
          )}
          {!disableNext && activeStep < STEPS.length - 1 && (
            <Button endIcon={<KeyboardArrowRightIcon fontSize="large" />} color="inherit" variant="text" disabled={activeStep === STEPS.length - 1} className={classes.nextBtn} onClick={() => handleNext(1)}>
              NEXT
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button size="small" color="inherit" variant="text" onClick={handleClose}>
          CLOSE
        </Button>
        {activeStep === STEPS.length - 1 && (
          <Button size="small" color="primary" variant="contained" className={classes.submitBtn} disabled={loading} onClick={handleSubmit}>
            {loading ? <CircularProgress size="16px" color="inherit" /> : 'CREATE'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default compose(inject('bookingStore'), observer)(DialogCreateBookingSessionTicket);
