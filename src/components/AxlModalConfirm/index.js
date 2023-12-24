import React from 'react';

import { Box, Button, CircularProgress, makeStyles } from '@material-ui/core';

import AxlDialog from '../AxlDialog';

const useStyles = makeStyles({
  btnCancel: {
    backgroundColor: '#fff',
    color: '#4a4a4a',
    minWidth: 120,
    border: '1px solid #4a4a4a',
  },
  btnSave: {
    backgroundColor: '#75c31e',
    color: '#fff',
    minWidth: 120,
    border: '1px solid #75c31e',
    '&:hover': {
      backgroundColor: '#75c31e',
    },
    '&:disabled': {
      backgroundColor: '#75c31e',
    },
  }
});

function AxlModalConfirm({
  alignTitle,
  isOpen, 
  maxWidth, 
  componentTitle, 
  componentChildren, 
  componentAction, 
  handleClose, 
  handleOK, 
  textCancel, 
  textOK, 
  isSaving,
  customStyleCancel,
  customStyleSave,
}) {
  const classes = useStyles();

  return (
    <AxlDialog
      alignTitle={alignTitle || 'center'}
      isOpen={isOpen}
      childrenTitle={componentTitle || 'CONFIRMATION'}
      maxWidth={maxWidth || 'sm'}
      handleClose={handleClose}
      children={componentChildren}
      childrenAction={
        componentAction || 
        (<Box display='flex' justifyContent='flex-end' px={1} style={{gap: 8}}>
          <Button 
            onClick={handleClose} 
            disabled={isSaving} 
            variant='outlined' 
            style={customStyleCancel} 
            size='small'
            classes={{root: classes.btnCancel}}
          >{textCancel || 'Cancel'}</Button>
          <Button 
            onClick={handleOK} 
            variant='contained' 
            disabled={isSaving} 
            style={customStyleSave} 
            size='small'
            classes={{root: classes.btnSave}}
          >
            {isSaving && <CircularProgress size={20}/>}
            {!isSaving && (textOK || 'Save')}
          </Button>
        </Box>)
      }
    />
  )
}

export default AxlModalConfirm