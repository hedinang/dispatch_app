import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import { inject } from 'mobx-react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import TooltipContainer from '../TooltipContainer';
import usePickupEnforcer from '../../hooks/Ticket/PickupEnforcer';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles((theme) => ({
  switchButton: {
    marginLeft: theme.spacing(7),
  },
}));

function PickupEnforcer(props) {
  const { session, sessionId, permissionStore } = props;
  const classes = useStyles();

  const { updating, updatePickupEnforcer } = usePickupEnforcer();
  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState();

  useEffect(() => {
    if (session && !!session.session && !!session.session.attributes) {
      if (!!session.session.attributes.enforce_pickup_time && session.session.attributes.enforce_pickup_time === 'true') {
        setEnable(true);
      } else {
        setEnable(false);
      }
    }
  }, [sessionId]);

  const handleCloseConfirmation = (e) => {
    setOpen(false);
  };

  const handleUpdateEnforce = (e) => {
    setOpen(true);
  };

  const updateEnforcer = () => {
    if (enable === undefined || !session || !session.session) {
      return;
    }

    updatePickupEnforcer(session.session.id, !enable, (data) => {
      setEnable(!enable);
      setOpen(false);
    });
  };

  const isDenied = permissionStore.isDenied(ACTIONS.TICKETS.UPDATE_ENFORCER);

  if (!session || enable === undefined) return null;

  return (
    <React.Fragment>
      <FormGroup className={classes.switchButton}>
        <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''} wrapped={false}>
          <FormControlLabel control={<IOSSwitch checked={enable} disabled={isDenied} onChange={handleUpdateEnforce} name="pickup_enforce_status" />} label="Pickup Enforcer" />
        </TooltipContainer>
      </FormGroup>
      <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={handleCloseConfirmation} aria-labelledby="max-width-dialog-title">
        <DialogTitle id="max-width-dialog-title">{enable ? 'Disable' : 'Enable'} Pickup Enforcer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to {enable ? 'disable' : 'enable'} pickup enforcer for booking session: <b>{session.session.name}</b>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={updating} onClick={handleCloseConfirmation}>
            No
          </Button>
          <Button disabled={updating} onClick={updateEnforcer} color="primary">
            {updating ? 'Updating' : 'Yes'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default compose(inject('permissionStore'))(PickupEnforcer);
