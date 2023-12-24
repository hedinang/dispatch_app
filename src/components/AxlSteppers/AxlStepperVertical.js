import React from 'react';

import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import { makeStyles } from '@material-ui/core';

import AxlStepIcon from '../AxlStepIcon';

const useStyles = makeStyles((theme) => ({
  rootStepper: {
    paddingTop: 0,
  },
  label: {
    fontSize: '0.875rem',
  },
}));

export default function AxlSteppers({steps, activeStep}) {
  if (!steps || steps.length === 0) return null;

  const classes = useStyles();

  return (
    <Stepper activeStep={activeStep} orientation="vertical" classes={{root: classes.rootStepper}}>
      {steps.map((step, idx) => (
        <Step key={step.label || idx} connector={step.connector}>
          <StepLabel icon={step.iconLabel ? step.iconLabel : idx + 1} error={step.error} StepIconComponent={AxlStepIcon} classes={{ label: classes.label}}>{step.label}</StepLabel>
          <StepContent style={{marginBottom: 8, fontFamily: 'AvenirNext', whiteSpace: 'pre'}}>
            {step.content}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
