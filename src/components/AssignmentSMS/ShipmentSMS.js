import React, { useEffect, useState } from 'react';
import { AxlButton } from 'axl-reactjs-ui';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TableCell,
} from '@material-ui/core';
import Description from './Description';
import styles from './styles';
import api from '../../stores/api';
import DialogSMSCost from '../DialogSMSCost';

const useStyles = makeStyles(theme => ({
  textField: {
    width: '100%',
  },
  sendBtn: {
    textAlign: 'center',
    width: '100%'
  },
}));

const ShipmentSMS = ({ assignmentId, userId, closePopup }) => {
  const content = React.useRef('');
  const [shipments, setShipments] = useState([]);
  const [SMSCost, setSMSCost] = useState();
  const [isEnableSave, setIsEnableSave] = useState(false);
  const classes = useStyles();
  const loadData = (assignmentId, userId) => {
    api.get(`/assignments/${assignmentId}/shipments/sms`).then(resp => {
      if (resp.ok) {
        if (resp.data && resp.data.length > 0) {
          setShipments(resp.data);
        }
      }
    });
  };

  const clearSMSCost = () => {
    this.setState({SMSCost: null})
  }

  const getEstimatedSMSCost = (content, shipmentIds, assignmentId) => {
    const data = {
      ids: shipmentIds,
      content
    }
    api.post(`/assignments/${assignmentId}/shipments/estimated_sms`, data).then(resp => {
      if (resp.ok) {
        setSMSCost(resp.data);
      }
    });
  }


  useEffect(() => {
    loadData(assignmentId, userId);
  }, [assignmentId, userId]);

  const handleChangeText = () => {
    if (content.current.value) {
      setIsEnableSave(true);
    } else if (content.current.value === '') {
      setIsEnableSave(false);
    }
  };

  const sendSmsAction = (content, shipmentIds, assignmentId) => {
    const data = {
      ids: shipmentIds,
      content
    }
    api.post(`/assignments/${assignmentId}/shipments/sms`, data).then(resp => {
      if (resp.ok) {
        const noteContent = `Send SMS to shipment: ${shipmentIds} with content: '${content}'`
        api.post(`/notes/AS_${assignmentId}`, noteContent).then(resp => {
        });
        closePopup(false);
      }
    });
  }

  return (
    <div style={styles.container}>
      <TextField
        label="Content"
        multiline
        rows={3}
        variant="outlined"
        id="standard-start-adornment"
        inputRef={content}
        InputLabelProps={{ shrink: true }}
        className={classes.textField}
        onChange={handleChangeText}
      />
      <div className={classes.sendBtn}>
        <AxlButton
          variant="contained"
          bg={`pink`}
          disabled={!isEnableSave}
          onClick={() => {
            const ids = shipments.map(item => item.id);
            if (content.current.value && ids.length > 0) {
              sendSmsAction(content.current.value, ids, assignmentId);
            }
          }}
        >
          Send SMS
        </AxlButton>
        <AxlButton
          variant="contained"
          bg={`gray`}
          onClick={() => {
            closePopup(false);
          }}
        >
          Cancel
        </AxlButton>
        <Description />
      </div>
      <TableContainer>
        <Table aria-labelledby="tableTitle" aria-label="enhanced table">
          <TableHead>
            <TableRow>
              <TableCell>Shipment Id</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments.map(item => (
              <TableRow hover tabIndex={-1} key={item.id}>
                <TableCell component="th" id={`shipment-${item.id}`} scope="row">
                  {item.id}
                </TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <DialogSMSCost SMSCost={SMSCost} callbackSmsAction={() => sendSmsAction(content.current.value, shipments.map(item => item.id), assignmentId)} clearSMSCost={() => clearSMSCost()}></DialogSMSCost>
    </div>
  );
};
export default ShipmentSMS;
