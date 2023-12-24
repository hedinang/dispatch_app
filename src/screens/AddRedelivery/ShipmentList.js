import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ReactMapGL, { Marker, Popup, LinearInterpolator } from 'react-map-gl';
import DeckGL, { PathLayer, IconLayer, ScatterplotLayer } from 'deck.gl';
import { AxlDateInput, AxlMultiSelect, AxlButton, AxlSimpleDropDown } from 'axl-reactjs-ui';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Paper,
  Slide,
} from '@material-ui/core';

const useStyles = makeStyles({
  toggle: {
    marginLeft: 'auto',
  },
  loading: {
    width: '100%',
  },
  root: {
    width: '100%',
    position: 'relative',
    maxHeight: '700px',
  },
  paper: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 5,
  },
  tableList: {
    '& .MuiTableRow-root.MuiTableRow-hover:hover': {
      cursor: 'pointer',
    },
  }
});
const ShipmentList = ({ shipments, isOpen, setOpen, handleClickShipment, shipmentSelected, onAddShipments, adding }) => {
  
  const classes = useStyles();
  const [isSuccessClass, setIsSuccessClass] = useState('');
  
  // can add
  const canAddShipments = shipments ? shipments.filter(s => s.added === undefined && !s.no_nearest && !s.too_far) : []

  const handleClick = (event, shipment) => {
    handleClickShipment(shipment, shipmentSelected);
    // history.push(`/maps/${id}`);
    // setOpen(false);
  };
  return (
    <Slide direction="right" in={isOpen}>
      <Paper elevation={4} className={classes.paper}>
        <TableContainer component={Paper} className={classes.root}>
          <div style={{ marginLeft: 5 }}>
            Total shipments: <b>{shipments.length}</b>
          </div>
          {/* {shipments && shipments.length === 0 && <LinearProgress color="primary" className={classes.loading} />} */}
          <Table className={classes.tableList} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Shipment</TableCell>
                <TableCell>Assignment Id</TableCell>
                <TableCell>Target Assignment Id</TableCell>
                <TableCell>Distance (miles)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipments &&
                shipments.map(row => {
                  let succesAddClass = 'none';
                  if (row.added === true)  {
                    succesAddClass = '#4ca96e';
                  } else if (row.added === false) {
                    succesAddClass = '#e3002b';
                  } else if (row.too_far) {
                    succesAddClass = '#ccc';
                  } else if (row.no_nearest) {
                    succesAddClass = '#999';
                  }
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={shipmentSelected.id === row.id}
                      onClick={event => handleClick(event, row)}
                      style={{backgroundColor: succesAddClass}}
                    >
                      <TableCell component="th" scope="row">
                        {row.id}
                        {row.message && <div>
                          {row.message}
                        </div>}
                      </TableCell>
                      <TableCell>{row.assignmentId}</TableCell>
                      <TableCell>{row.target_assignment_id}</TableCell>
                      <TableCell>{row.distance} (miles)</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {canAddShipments && canAddShipments.length > 0 && 
        <AxlButton 
          compact
          style={{ minWidth: 120 }}
          onClick={onAddShipments ? onAddShipments : () => {}}
          disabled={adding}>{adding? 'Adding' : `Add ${canAddShipments.length} Shipments`}</AxlButton>}
      </Paper>
    </Slide>
  );
};
export default ShipmentList;
