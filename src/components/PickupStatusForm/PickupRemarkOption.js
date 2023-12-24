import React, { useState } from 'react';
import { AxlModal } from 'axl-reactjs-ui';
import { Button, withStyles } from '@material-ui/core';

import SingleStop from './SingleStop';
import MultipleStop from './MultipleStop';

const styles = (theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
    minWidth: '300px',
    padding: `0 ${theme.spacing(2)}px`
  },
  title: {
    fontSize: '24px',
    color: '#4a4a4a',
    fontFamily: 'AvenirNext',
    fontWeight: 500
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  option: {
    '& > span': {
      color: '#7f79d9',
      fontSize: '16px',
      fontFamily: 'AvenirNext',
      fontWeight: 500
    }
  }
});

function PickupRemarkOption(props) {
  const [selectedMode, setSelectedMode] = useState('');
  const { classes, pickup, shipmentStore, assignmentStore, closeForm, style } = props;
  const { label } = shipmentStore.selectedStop;
  const { selectedAssignment } = assignmentStore;

  return (
    <AxlModal style={style} onClose={closeForm}>
      {selectedMode === '' && (
        <div className={classes.root}>
          <span className={classes.title}>Edit Pickup Status</span>
          <div className={classes.options}>
            <Button className={classes.option} onClick={() => setSelectedMode('single')}>
              { `Single Shipment - ${label && label.driver_label || ''}` }
            </Button>
            <Button className={classes.option} onClick={() => setSelectedMode('multiple')}>
              { `Multiple ${selectedAssignment.assignment.label || ''} Shipments` }
            </Button>
          </div>
        </div>
      )}
      {selectedMode === 'single' && <SingleStop pickup={pickup} closeForm={closeForm} shipmentStore={shipmentStore} />}
      {selectedMode === 'multiple' && <MultipleStop closeForm={closeForm} shipmentStore={shipmentStore} assignmentStore={assignmentStore} />}
    </AxlModal>
  );
}

export default withStyles(styles)(PickupRemarkOption);
