import React, { useState, useMemo, useEffect, useRef } from 'react';
// import { useRecoilValue } from "recoil";
import produce from 'immer';
import moment from 'moment';

import {
  Container,
  Grid,
  Box,
  Tooltip,
  CircularProgress,
  TextField,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  withStyles,
  Select,
  MenuItem,
  CardMedia,
  Chip,
} from '@material-ui/core';
import { AxlButton } from 'axl-reactjs-ui';
import { cloneDeep } from 'lodash';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { useStyles } from './styles';
import ShipmentList from './ShipmentList';
import ShipmentMap from '../MapCanvas';
import { orderShipment, resetAssignmentOrder } from '../../stores/api';
import { images } from '../../constants/images';
// import AxlButton from "../../AxlMUIComponent/AxlButton";
const AFTER = 'after';
const BEFORE = 'before';

// return {shipment_id, sequence_id};
const updateSequenceAPI = (stops, getMaxSequenceId = 100000) => {
  let sequence = getMaxSequenceId;
  let newList = [];
  cloneDeep(stops).forEach(s => {
    sequence += 10000;
    const newStop = produce(s, draft => {
      s.sequence_id = sequence;
    });
    newList.push(newStop);
  });
  return newList;
};

export const secondTohour = minute => {
  if (!minute) return '';
  const duration = moment.duration(minute, 'seconds');

  //calculate hours
  const hh = duration.years() * (365 * 24) + duration.months() * (30 * 24) + duration.days() * 24 + duration.hours();

  //get minutes
  const mm = duration.minutes();
  if (hh === 0) return mm + 'mins';
  //return total time in hh:mm format
  return hh + 'hrs ' + mm + 'mins';
};

const cloneDeepOriginalStop = stops => {
  return cloneDeep(stops)
    .filter(s => !s._deleted)
    .filter(s => ['DROP_OFF', 'RETURN'].indexOf(s.type) >= 0);
};

const cloneSelectedStop = stops => {
  const cloneSelectedFilter = produce(stops, draft => {
    draft.filter(s => ['FAILED', 'SUCCEEDED'].indexOf(s.status) < 0);
  });
  return cloneSelectedFilter.map(stop => {
    return {
      id: stop.id,
      driver_label: stop.label ? stop.label.driver_label : '',
      shipment_id: stop.shipment_id,
      status: stop.status,
    }
  })
};

const ReorderShipment = ({ assignmentStore }) => {
  const { selectedAssignment } = assignmentStore;
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [stopSelected, setStopSelected] = useState([]);
  const travelTime = selectedAssignment && selectedAssignment.assignment.travel_time;

  const [stopsDisplay, setStopsDisplay] = useState([]);
  const [dropoffStop, setDropoffStop] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [action, setAction] = useState(AFTER);
  const [shipmentOrder, setShipmentOrder] = useState('');
  const [diffTime, setDiffTime] = useState(0);

  const [newTravelTime, setNewTravelTime] = useState('');
  const [stopListForSelect, setStopListSelected] = useState([]);
  const payloadRef = useRef({});
  const classes = useStyles();

  useEffect(() => {
    if (selectedAssignment && selectedAssignment.stops) {
      setStopsDisplay(cloneDeep(selectedAssignment.stops));

      const listDropoff = cloneDeepOriginalStop(selectedAssignment.stops);
      setDropoffStop(listDropoff);

      const cloneSelectedFilter = cloneSelectedStop(listDropoff)
      setStopListSelected(cloneSelectedFilter);
    }
    return () => {
      closePopup();
    };
  }, [selectedAssignment]);

  const labelSelected = useMemo(() => {
    return stopSelected.map(s => dropoffStop.find(stop => stop.id === s).label.driver_label);
  }, [stopSelected]);

  useEffect(() => {
    let cloneSelectedFilter = cloneSelectedStop(dropoffStop)
    if (stopSelected.length !== 0) {
      cloneSelectedFilter = cloneSelectedFilter.filter(
        stop => stopSelected.length === 0 || !stopSelected.includes(stop.id),
      );
    }
    setStopListSelected(cloneSelectedFilter);
  }, [stopSelected, dropoffStop]);

  useEffect(() => {
    if (newTravelTime && travelTime) {
      setDiffTime(newTravelTime - travelTime);
    }
  }, [newTravelTime, travelTime]);

  const confirmOrder = () => {
    if (payloadRef.current && payloadRef.current.stops && payloadRef.current.stops.length > 0) {
      payloadRef.current.is_preview = 0;
      setLoading(true);
      orderShipment(selectedAssignment.assignment.id, payloadRef.current).then(resp => {
        setLoading(false);
        assignmentStore.loadAssignment(selectedAssignment.assignment.id);
        closePopup(true);
      });
    }
  };

  const closePopup = (isSave = false) => {
    payloadRef.current = {};
    setIsOpenPopup(false);
    setShipmentOrder('');
    setAction(AFTER);
    setDiffTime(0);
    setNewTravelTime('');
    setStopSelected([]);
    if (!isSave && selectedAssignment.stops) {
      setStopsDisplay(cloneDeep(selectedAssignment.stops));
      setDropoffStop(cloneDeepOriginalStop(selectedAssignment.stops));
    }
  };
  const handleChangeAction = e => {
    setAction(e.target.value);
  };

  const undoAction = () => {
    payloadRef.current = {};
    setNewTravelTime('');
    setDiffTime(0);
    setStopsDisplay(cloneDeep(selectedAssignment.stops));
    setDropoffStop(cloneDeepOriginalStop(selectedAssignment.stops));
  };

  const reverseOrder = () => {
    const revertList = produce(dropoffStop, draft => {
      draft.reverse();
    });
    if (revertList.length > 0) {
      setLoadingPreview(true);
      const pickupStop = selectedAssignment.stops.filter(s => 'PICK_UP' === s.type);
      const getMaxSequenceId = pickupStop.reduce((a, b) => (a.sequence_id > b.sequence_id ? a : b)).sequence_id;
      payloadRef.current = {
        stops: revertList.map(s => s.id),
        is_preview: 1,
      };
      orderShipment(selectedAssignment.assignment.id, payloadRef.current).then(resp => {
        setLoadingPreview(false);
        if (resp.ok && resp.data) {
          setNewTravelTime(resp.data.travel_time);
        } else if (resp.data && resp.data.message) {
          setErrorMsg(resp.data.message);
        }
      });
      setDropoffStop(revertList);
      setStopsDisplay([...pickupStop, ...updateSequenceAPI(revertList, getMaxSequenceId)]);
    }
  };

  const applyOrderAction = data => {
    const shipmentTarget = data || shipmentOrder; //stop.id
    const unSelectedStopList = cloneDeep(dropoffStop).filter(stop => !stopSelected.includes(stop.id));
    const indexShipment = unSelectedStopList.findIndex(stop => stop.id === shipmentTarget);
    if (indexShipment > -1 && stopSelected.length > 0) {
      const selectedStopList = stopSelected.map(s => dropoffStop.find(stop => stop.id === s));
      let newList = [];
      if (action === BEFORE) {
        newList = produce(unSelectedStopList, draft => {
          draft.splice(indexShipment, 0, ...selectedStopList);
        });
      } else if (action === AFTER) {
        newList = produce(unSelectedStopList, draft => {
          draft.splice(indexShipment + 1, 0, ...selectedStopList);
        });
      }
      if (newList.length > 0) {
        setLoadingPreview(true);
        const pickupStop = selectedAssignment.stops.filter(s => 'PICK_UP' === s.type);
        const getMaxSequenceId = pickupStop.reduce((a, b) => (a.sequence_id > b.sequence_id ? a : b)).sequence_id;
        payloadRef.current = {
          stops: newList.map(s => s.id),
          is_preview: 1,
        };
        orderShipment(selectedAssignment.assignment.id, payloadRef.current).then(resp => {
          setLoadingPreview(false);
          if (resp.ok && resp.data) {
            setNewTravelTime(resp.data.travel_time);
          } else if (resp.data && resp.data.message) {
            setErrorMsg(resp.data.message);
          }
        });
        setDropoffStop(newList);
        setStopsDisplay([...pickupStop, ...updateSequenceAPI(newList, getMaxSequenceId)]);
      }
    }
  };

  const handleChangeShipment = e => {
    setShipmentOrder(e.target.value);
    applyOrderAction(e.target.value);
  };
  const resetOrder = e => {
    if (selectedAssignment.assignment && selectedAssignment.assignment.id) {
      resetAssignmentOrder(selectedAssignment.assignment.id).then(resp => {
        if (resp.ok) {
          assignmentStore.loadAssignment(selectedAssignment.assignment.id);
        }
      });
    }
  };
  return (
    <Box style={{ marginTop: 4 }}>
      <Tooltip title="Reorder shipment within assignment" aria-label="Reorder shipment within assignment">
        <Button
          disableElevation
          variant="outlined"
          onClick={() => setIsOpenPopup(true)}
          size="small"
          className={classes.footerButton}
        >
          <CardMedia className={classes.footerBtnIcon2} image={images.icon.reorder} />
        </Button>
      </Tooltip>
      <Dialog maxWidth="md" fullWidth open={isOpenPopup} onClose={() => closePopup()}>
        <DialogTitle disableTypography className={classes.dialogTitle}>
          Reorder shipment
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Grid container>
            <Grid item sm={6}>
              <ShipmentList stops={dropoffStop} setStopSelected={setStopSelected} />
            </Grid>
            <Grid item sm={6} className={classes.rightContent}>
              <div className={classes.mapWrapper}>
                <ShipmentMap stops={stopsDisplay} assignment={selectedAssignment} />
              </div>
              <Grid item sm={12} className={classes.smallText}>
                Current est. route time: <span style={{ fontWeight: 600 }}>{secondTohour(travelTime)}</span>
              </Grid>
              <Grid item sm={12} className={classes.smallText}>
                New est. route time:{' '}
                <span style={{ fontWeight: 600 }}>
                  {secondTohour(newTravelTime)}{' '}
                  {diffTime !== 0 && (
                    <span style={{ color: diffTime < 0 ? '#77b45c' : 'red' }}>
                      ({diffTime > 0 ? '+' : ''}
                      {secondTohour(diffTime)})
                    </span>
                  )}
                </span>
              </Grid>

              <Grid item sm={12} className={classes.errorText}>
                {errorMsg}
              </Grid>
              {loadingPreview && (
                <div style={{ textAlign: 'center' }}>
                  <CircularProgress color="primary" size={30} />
                </div>
              )}
            </Grid>
            <Grid item sm={12} className={classes.smallText}>
              Selected shipment(s):{' '}
              {labelSelected.map(l => (
                <Chip className={classes.chip} label={`${labelSelected.indexOf(l) + 1} | ${l}`} />
              ))}
            </Grid>
            <Grid item sm={12} className={classes.smallText}>
              Move selected shipment(s){' '}
              <Select
                classes={{ root: classes.selectBtn }}
                variant="outlined"
                labelId="action-reorder"
                id="action-reorder"
                value={action}
                onChange={handleChangeAction}
              >
                <MenuItem value={BEFORE}>Before</MenuItem>
                <MenuItem value={AFTER}>After</MenuItem>
              </Select>{' '}
              Shipment{' '}
              <Select
                classes={{ root: classes.selectBtn }}
                variant="outlined"
                labelId="shipmentId-reorder"
                id="shipmentId-reorder"
                value={shipmentOrder}
                onChange={handleChangeShipment}
              >
                {stopListForSelect.map(stop => (
                  <MenuItem key={stop.id} value={stop.id}>
                    {stop.driver_label}
                  </MenuItem>
                ))}
              </Select>
              <div style={{ display: 'inline-flex' }}>
                <AxlButton bg={'white'} compact={true} onClick={undoAction}>{`Undo`}</AxlButton>
                <AxlButton bg={'bluish'} compact={true} onClick={() => reverseOrder()}>{`Reverse order`}</AxlButton>
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Tooltip title="It will reset order all shipment by label">
            <AxlButton tiny bg={'bluish'} compact={true} onClick={resetOrder}>{`Reset By Label`}</AxlButton>
          </Tooltip>
          <AxlButton
            compact={true}
            className={classes.whiteBtn}
            disableElevation
            onClick={closePopup}
            bg={'gray'}
          >{`Cancel`}</AxlButton>
          <Box className={classes.buttonWrapper}>
            <AxlButton
              compact={true}
              bg={payloadRef.current.stops ? 'periwinkle' : 'gray'}
              color={'white'}
              className={classes.confirmBtn}
              disableElevation
              disabled={!payloadRef.current.stops || loading || loadingPreview}
              onClick={confirmOrder}
            >{`Save`}</AxlButton>
            {loading && <CircularProgress color="primary.periwinkle" size={30} className={classes.buttonLoading} />}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default ReorderShipment;
