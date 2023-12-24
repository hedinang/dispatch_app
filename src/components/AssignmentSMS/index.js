import React, { useEffect, useState } from 'react';
import { AxlButton } from 'axl-reactjs-ui';
import styles from './styles';
import { Dialog, DialogTitle, Grid, DialogContent, Typography, Tooltip } from '@material-ui/core';
import ShipmentSMS from './ShipmentSMS';

const AssignmentSMS = ({ assignmentId, userId, stops }) => {
  const [isShowPopup, setIsShowPopup] = useState(false);

  function downloadCsv() {
    const csv = stops.filter(s => !!s.shipment).map(stop => {
      const {shipment, client} = stop;
      return [client.id, client.company, shipment.id, shipment.tracking_code, shipment.customer.name].join(",");
    });
    const csvContent = "client_id,company,shipment_id,tracking_code,customer_name\n" + csv.join("\n");
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', "info.csv");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div style={styles.container}>
      <Grid container justifyContent="space-between">
        <Tooltip title="Only send SMS to Customer under this Assignment">
          <span>
            <AxlButton bg={'white'} tiny={true} compact={true} onClick={() => setIsShowPopup(true)}>
              Send SMS to Customers
            </AxlButton>
          </span>
        </Tooltip>
        <AxlButton bg="white" tiny compact onClick={downloadCsv}>
          Download Tracking Info
        </AxlButton>
      </Grid>
      <Dialog fullWidth open={isShowPopup} onClose={() => setIsShowPopup(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          <Typography variant="h5">Send SMS Notification to Customers</Typography>
        </DialogTitle>
        <DialogContent>
          <ShipmentSMS assignmentId={assignmentId} closePopup={setIsShowPopup} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AssignmentSMS;
