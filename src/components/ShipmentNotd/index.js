import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, Grid, DialogContent, Typography, Tooltip } from '@material-ui/core';
import api from '../../stores/api';
import NotdPopup from '../NotdPopup';
import NotdBar from '../NotdBar';
import styles from './styles';


const ShipmentNotd = ({ shipmentId }) => {
  const [notd, setNotd] = useState({});
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [reasonList, setReasonList] = useState([]);

  const loadData = shipmentId => {
    api.get(`/notd/${shipmentId}/shipments`).then(resp => {
      if (resp.ok && resp.data) {
        setNotd(resp.data);
      } else {
        setNotd({});
      }
    });
  };

  const getShipmentReason = () => {
    api.get(`/notd/reason/shipments`).then(resp => {
      if (resp.ok && resp.data) {
        setReasonList(resp.data)
      }
    });
  }
  useEffect(() => {
    loadData(shipmentId);
    getShipmentReason();
  }, [shipmentId]);

  const saveNotd = (code, note) => {
    console.log('save code' , code)
    console.log('save note' , note)
    api.post(`/notd/${shipmentId}/shipments`, { code, note }).then(resp => {
      if (resp.ok && resp.data) {
        setNotd(resp.data);
      }
      setIsShowPopup(false);
    });
  };
  return (
    <div style={styles.container}>
      <NotdBar code={notd.code} note={notd.note} openFnc={() => setIsShowPopup(true)} />
      <Dialog fullWidth open={isShowPopup} onClose={() => setIsShowPopup(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          <Typography variant="h5" style={styles.title}>
            Shipment NOTD Reason Code
          </Typography>
        </DialogTitle>
        <DialogContent>
          <NotdPopup title={'Shipment'} code={notd.code} note={notd.note} reason={reasonList} closePopup={() => setIsShowPopup(false)} saveAction={saveNotd} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default React.memo(ShipmentNotd);
