import React from 'react';

import { CircularProgress, createStyles, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export const useLoadingStepIconStyles = makeStyles(() =>
  createStyles({
    root: {
      width: 24,
      height: 24,
      textAlign: 'center',
      fontFamily: 'AvenirNext',
      position: 'relative',
      fontSize: 24,
    },
    step: {
      border: '1px solid #3f51b5',
      color: '#3f51b5',
      borderRadius: '50%',
      fontSize: '0.85rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 22,
      width: 22,
    },
  })
);

function AxlStepIcon(props) {
  const classes = useLoadingStepIconStyles();
  const { active, completed, error } = props;

  const icons = {
    loading: <CircularProgress size={24} />,
  };

  if (error) {
    return (
      <div className={clsx(classes.root)}>
        <CancelIcon color='error' fontSize='inherit' />
      </div>
    )
  }

  if (completed) {
    return (
      <div className={clsx(classes.root)}>
        <CheckCircleIcon htmlColor='#4abc4e' fontSize='inherit' />
      </div>
    )
  }

  const propsIcon = String(props.icon);
  return (
    <div className={clsx({
      [classes.root]: true,
      [classes.step]: propsIcon != 'loading'
    })}>
      {icons[propsIcon] || props.icon}
    </div>
  );
}

export default AxlStepIcon;
