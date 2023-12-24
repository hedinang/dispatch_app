import React, { Fragment, useState } from 'react'
import { Box, Button, CircularProgress, IconButton, Menu, MenuItem, Tooltip, makeStyles } from '@material-ui/core';
import { inject } from 'mobx-react';
import { compose } from 'recompose';
import { toast } from 'react-toastify';
import SnoozeIcon from '@material-ui/icons/Snooze';
import TimerOffIcon from '@material-ui/icons/TimerOff';
import TimerIcon from '@material-ui/icons/Timer';

import { updatePickupEnforce } from '../../stores/api';
import { toastMessage } from '../../constants/toastMessage';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import AxlDialog from '../AxlDialog';

const useStyles = makeStyles({
  popper: {
    zIndex: 1,
  }
})

const getBorder = (status) => {
  switch (status) {
    case 'true':
      return "1px solid #3ad052"
    case 'false':
      return "1px solid red"
    default:
      return "1px solid #4a4a4a"
  }
}

const options = [
  {
    value: null,
    label: 'none',
    title: 'none',
  },
  {
    value: true,
    label: 'true',
    title: 'on',
  },
  {
    value: false,
    label: 'false',
    title: 'off',
  },
];

function MenuEnforcer(props) {
  const { book, bookingStore, permissionStore } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const open = Boolean(anchorEl);
  const enforcePickupTime = book && book.attributes && book.attributes.enforce_pickup_time;
  const isDenied = permissionStore.isDenied(ACTIONS.TICKETS.UPDATE_ENFORCER);
  const [isConfirm, setIsConfirm] = useState(false);
  const [status, setStatus] = useState(null);
  const classes = useStyles();

  const handleClickEnforcer = (evt) => {
    setAnchorEl(evt.currentTarget)
  }

  const handleCloseMenuEnforcer = () => {
    setAnchorEl(null);
  };

  const handleMenuItem = (val) => {
    if(val === null && !enforcePickupTime) return;
    if(`${val}` == enforcePickupTime) return;

    handleCloseMenuEnforcer();
    setStatus(val);
    setIsConfirm(true);
  }

  const handleClose = () => {
    setIsConfirm(false);
    setStatus(null);
  }

  const handleSave = () => {
    if(!book || !bookingStore) return;
    setIsLoading(true);
    updatePickupEnforce(bookingStore.activeSession.session.id, book.id, {enforce_pickup_status: status}).then(res => {
      if(!res.ok) {
        setIsLoading(false);
        if(!res.status) {
          toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
          return;
        }

        const {errors, message} = res && res.data;
        if(errors) {
          toast.error(errors.join('\n\n'), {containerId: 'main'});
          return;
        }
        if(message) {
          toast.error(message.split('\r\n').join('\n\n'), {containerId: 'main'});
          return;
        }
        toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
        return;
      }
      setIsConfirm(false);
      setStatus(null);
      bookingStore.loadSession(`BS_${bookingStore.activeSession.session.id}`, (res) => {
        setIsLoading(false);
      })
      toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
    })
  }

  return (
    <Fragment>
      <Tooltip title={isDenied ? PERMISSION_DENIED_TEXT : `Pickup Enforcer: ${enforcePickupTime == null ? 'NONE' : (enforcePickupTime == 'true' ? 'ON' : 'OFF')}`} classes={{popper: classes.popper}}>
        <div style={{marginLeft: 6}}>
          <IconButton
            onClick={handleClickEnforcer}
            size='small'
            style={{border: isDenied ? '1px solid rgb(181,181,181)' : getBorder(enforcePickupTime)}}
            disabled={isDenied}
          >
            {!enforcePickupTime && <TimerIcon fontSize="small" />}
            {enforcePickupTime === 'true' && <SnoozeIcon fontSize="small" htmlColor='#3ad052'/>}
            {enforcePickupTime === 'false' && <TimerOffIcon fontSize="small" htmlColor='red'/>}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenuEnforcer}
          >
            {options.map((option) => (
              <MenuItem key={option.label} 
                selected={enforcePickupTime ? option.label == enforcePickupTime : option.value == enforcePickupTime} 
                onClick={() => handleMenuItem(option.value)} dense={true}>
                {option.title.toUpperCase()}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </Tooltip>

      <AxlDialog 
        isOpen={isConfirm} 
        maxWidth='sm'
        childrenTitle={'Confirmation'}
        children={
          <Fragment>
            <span>Do you want to{' '}</span>
            <span>{status === null ? 'unset' : (status ? 'enable' : 'disable')}</span>
            <span>{' '}pickup enforcer for group:{' '}</span>
            <strong>{book.name}</strong>?
          </Fragment>
        }
        handleClose={handleClose}
        childrenAction={
          <Box display='flex' justifyContent='flex-end'>
            <Button onClick={handleClose} disabled={isLoading} style={{marginRight: 8}}>Cancel</Button>
            <Button onClick={handleSave} variant='contained' color='primary' disabled={isLoading}>
              {isLoading && <CircularProgress size={20}/>}
              {!isLoading && 'Save'}
            </Button>
          </Box>
        }
        DialogContentProps={{
          style: {
            padding: '24px 16px'
          }
        }}
      />
    </Fragment>
  )
}


export default compose(inject('bookingStore', 'permissionStore'))(MenuEnforcer);