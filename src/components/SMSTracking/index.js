import React, { useEffect, useState } from 'react';
import AxlButton from '../AxlMUIComponent/AxlButton';
import TextsmsIcon from '@material-ui/icons/Textsms';
import { Dialog, DialogTitle, Grid, DialogContent, Typography, Tooltip, Button, CardMedia } from '@material-ui/core';
import styles from './styles';
import { sendTrackingLink, sendSignatureLink } from '../../stores/api';

const SMSTracking = ({ shipmentId }) => {
  const [isShowPopup, setIsShowPopup] = useState(false);

  return (
    <span>
      <div>
        <AxlButton
          icon
          tooltip={{ title: 'Send tracking link or signature link to customer' }}
          padding={'4px 4px'}
          spacing={0}
          onClick={() => setIsShowPopup(true)}
          bgcolor="primary.grayEleventh"
        >
          <TextsmsIcon fontSize={'small'} style={{ color: '#aaa' }} />
        </AxlButton>
      </div>
      <Dialog fullWidth open={isShowPopup} onClose={() => setIsShowPopup(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          <Typography variant="h4">Send Link to Customer</Typography>
        </DialogTitle>
        <DialogContent style={styles.content}>
          <AxlButton
            tooltip={{ title: 'Send Tracking Link To customer' }}
            padding={0}
            spacing={0}
            onClick={() => {
              sendTrackingLink(shipmentId);
              setIsShowPopup(false);
            }}
            bgcolor="primary.periwinkle"
            color="primary.main"
          >
            Send Tracking Link
          </AxlButton>
          <AxlButton
            tooltip={{ title: 'Send Signature/Idscan Link to customer' }}
            padding={0}
            spacing={0}
            onClick={() => {
              sendSignatureLink(shipmentId);
              setIsShowPopup(false);
            }}
            bgcolor="primary.periwinkle"
            color="primary.main"
          >
            Send Signature Link
          </AxlButton>
        </DialogContent>
      </Dialog>
    </span>
  );
};
export default SMSTracking;
