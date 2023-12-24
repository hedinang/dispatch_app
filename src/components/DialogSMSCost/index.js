import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, DialogActions } from '@material-ui/core';
import { AxlButton } from 'axl-reactjs-ui';

const styles = {
  container: {
    backgroundColor: '#f4f4f4',
    borderRadius: '4px',
    marginBottom: '10px',
    padding: '7.5px',
  },
  title: {
    fontSize: '15px',
    fontFamily: 'AvenirNext-Bold',
  },
  btn: {
    minWidth: 100,
  },
  action: {
    marginTop: 30,
  },
};

/*{
  "char_count": 6,
  "recipient_count": 2,
  "estimated_cost": 0.01
}*/
const DialogSMSCost = ({ SMSCost, callbackSmsAction, clearSMSCost }) => {
  const [isShowPopup, setIsShowPopup] = useState(false);

  const closePopup = () => {
    setIsShowPopup(false);
    clearSMSCost();
  };

  useEffect(() => {
    if (SMSCost) {
      setIsShowPopup(true);
    }
  }, [SMSCost]);

  return (
    <Dialog fullWidth open={isShowPopup} onClose={() => closePopup()} style={{ zIndex: 100000 }}>
      <DialogTitle id="sms-dialog-title">
        <Typography variant="h4">Estimated SMS Cost</Typography>
      </DialogTitle>
      <DialogContent>
        {SMSCost && (
          <div>
            This message will send to <b>{SMSCost.recipient_count}</b> people and cost around <b>${SMSCost.estimated_cost}</b>
          </div>
        )}
        <DialogActions style={styles.action}>
          <AxlButton style={styles.btn} compact bg={`gray`} onClick={() => closePopup()}>
            Cancel
          </AxlButton>
          <AxlButton
            style={styles.btn}
            compact
            bg={`pink`}
            onClick={() => {
              callbackSmsAction();
              closePopup();
            }}
          >
            Confirm
          </AxlButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

function areEqual(prevProps, nextProps) {
  return JSON.stringify(prevProps.SMSCost) === JSON.stringify(nextProps.SMSCost);
}
export default React.memo(DialogSMSCost, areEqual);
