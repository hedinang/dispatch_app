import React, { Fragment, useEffect, useState } from 'react';

import { Box, Button, Divider, Grid } from '@material-ui/core';
import { isEmpty, cloneDeep, concat } from 'lodash';
import { useHistory } from 'react-router-dom';

import AxlStepperVertical from '../AxlSteppers/AxlStepperVertical';
import AxlAutocomplete from '../AxlAutocomplete';
import { getAssignmentInfo, getBookingInfo, saveDirectBooking, saveTicketBooking } from '../../stores/api';
import AxlTextField from '../AxlTextField';
import AxlCheckbox from '../AxlCheckbox';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEFAULT_STEPS = [
  {
    label: 'Spliting',
    content: 'Currently, System is spliting route',
    error: false,
    iconLabel: 'loading',
    completed: false,
  },
  {
    label: 'New price is being calculated',
    content: 'Currently, System is calculating new price',
    error: false,
    iconLabel: 2,
    completed: false,
  },
  {
    label: 'Adding to booking',
    content: 'Currently, System is adding to booking',
    error: false,
    iconLabel: 3,
    completed: false,
  },
  {
    label: 'Done',
    content: 'Completed split route',
    error: false,
    iconLabel: 4,
    completed: false,
  },
]

const TYPE = {
  TICKET: 'ticket',
}

const FIELD = {
  RELABEL: 'relabel',
  CBX_ADD_CURRENT: 'cbx_add_current',
  BOOKING: 'booking',
  BOOKING_GROUP: 'booking_group',
}

function SplitRoute({selectedAssignment, label, assignmentLabel, setIsSpliting, isSpliting, onClose, shipment, shipmentStore, assignmentStore, setNewAssignment}) {
  if (isEmpty(selectedAssignment) || isEmpty(label)) return null;

  const [newAssignmentLabel, setNewAssignmentLabel] = useState(assignmentLabel);
  const [activeStep, setActiveStep] = useState(0);
  const [booking, setBooking] = useState(null);
  const [bookingGroup, setBookingGroup] = useState(null);
  const [optListBooking, setOptListBooking] = useState([]);
  const [currentBookingInfo, setCurrentBookingInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isNextStep, setIsNextStep] = useState(false);
  const [checkboxes, setCheckboxes] = useState([
    {
      checked: false,
      name: FIELD.RELABEL,
      label: 'Relabel Shipments',
    },
  ]);
  const [cbxAddCurrent, setCbxAddCurrent] = useState([
    {
      checked: false,
      name: FIELD.CBX_ADD_CURRENT,
      label: 'Also add current assignment to booking',
    },
  ]);
  const [steps, setSteps] = useState(cloneDeep(DEFAULT_STEPS));
  const [newAssignmentSplit, setNewAssignmentSplit] = useState({});
  const [isSplitSuccess, setIsSplitSuccess] = useState(false);
  const history = useHistory();
  
  useEffect(() => {
    fetchData();
  }, [assignment && assignment.region_code]);

  const fetchData = async () => {
    setIsLoading(true);
    const bookingInfo = await getBookingInfo(assignment.id);
    if(bookingInfo.ok && bookingInfo.data) {
      const concatDirectBooking = concat(bookingInfo.data.booking_session, bookingInfo.data.direct_booking_session);
      setOptListBooking(concatDirectBooking);
      setCurrentBookingInfo(bookingInfo.data.current_booking_info);

      if (!isEmpty(bookingInfo.data.current_booking_info)) {
        const findBooking = concatDirectBooking && concatDirectBooking.find(fb => fb.id === bookingInfo.data.current_booking_info.booking_session_id || fb.id === bookingInfo.data.current_booking_info.direct_booking_session_id);
        setBooking(findBooking || null);
        if(findBooking) {
          setBookingGroup(findBooking && findBooking.groups && findBooking.groups.find(g => g.id === bookingInfo.data.current_booking_info.ticket_book_id) || null);
        }
      }
    }
    else {
      setOptListBooking([]);
      setCurrentBookingInfo({});
    }
    setIsLoading(false);
  }

  const handleChangeCheckbox = (evt, setField, fields) => {
    setField(fields.map(checkbox => {
      if (checkbox.name === evt.target.name) {
        checkbox.checked = evt.target.checked;
        return checkbox;
      }
      return checkbox
    }))
  }

  const handleChange = (val, setField, field) => {
    setField(val);
    
    if (field === FIELD.BOOKING && val && currentBookingInfo && (val.id === currentBookingInfo.booking_session_id || val.id === currentBookingInfo.direct_booking_session_id))
    {
      setCbxAddCurrent(cbxAddCurrent.map(item => {
        item.checked = false;
        return item;
      }));
      setBookingGroup(val && currentBookingInfo && val.groups && val.groups.find(g => g.id === currentBookingInfo.ticket_book_id))
    }
    
    if (field === FIELD.BOOKING && val && (val.type != TYPE.TICKET || (currentBookingInfo && val.id !== currentBookingInfo.booking_session_id))) {
      setBookingGroup(null);
    }
  }

  const updateStep = (position, msgError) => {
    setSteps(steps.map((step, idx) => {
      if (msgError && idx === position) {
        step.error = true;
        step.content = msgError;
        return step;
      }

      if (idx === position - 1) {
        step.completed = true;
        step.iconLabel = position;
      }

      if (idx === position) {
        step.iconLabel = 'loading';
      }

      return step;
    }))
    setActiveStep(position);
  }

  const updateFailed = (position, msgError) => {
    updateStep(position, msgError);
    setIsSpliting(false);
  }

  const calculatePrice = async (newAssignmentId) => {
    let isRecall = true;
    while (isRecall) {
      const assignmentInfo = await getAssignmentInfo(newAssignmentId);
      if (assignmentInfo && assignmentInfo.ok && assignmentInfo.data.assignment && assignmentInfo.data.assignment.pricing_version) {
        isRecall = false;
      }
      await sleep(2000);
    }
    updateStep(2, '');
    return true;
  }

  const addBooking = async (newAssignmetId) => {
    if (!booking) {
      updateStep(3, '');
      return true;
    };

    let ids = [newAssignmetId];
    if (cbxAddCurrent[0].checked) {
      ids = ids.concat(shipment.assignment_id);
    }

    if (booking.type === TYPE.TICKET) {
      const respSaveTicket = await saveTicketBooking(bookingGroup && bookingGroup.id, booking && booking.id, ids);
      if (!respSaveTicket.ok) {
        updateFailed(2, respSaveTicket.data && respSaveTicket.data.message);
        return false;
      }
      updateStep(3, '');
      return true;
    }
    else {
      const respSaveDirectBooking = await saveDirectBooking(booking && booking.id, ids);
      if (!respSaveDirectBooking.ok) {
        updateFailed(2, respSaveDirectBooking.data && respSaveDirectBooking.data.message);
        return false;
      }
      updateStep(3, '');
      return true;
    }
  }

  const handleConfirmSpliting = async () => {
    setIsSpliting(true);
    setIsNextStep(true);
    setIsSplitSuccess(false);

    const payloadSplitRoute = {
      assignment_label: newAssignmentLabel,
      relabel_shipment: checkboxes[0].checked,
    };

    shipmentStore.splitRoute(shipment.assignment_id, shipment.id, payloadSplitRoute, async (result) => {
      if (result && (result.message || (result.message && result.message.error === 'true'))) {
        updateFailed(0, result.message || result.message.content);
        return;
      }

      if (history && history.location && !history.location.pathname.startsWith('/assignments')) {
        assignmentStore.appendSplitedAssignment(shipment.assignment_id, result.assignment);
      }

      setIsSplitSuccess(true);
      updateStep(1, '');
      setNewAssignmentSplit(result.assignment || {});
      setNewAssignment(result.assignment || {});
      let msgDSP = '';
      
      if (booking) {
        if (cbxAddCurrent[0].checked) {
          const currentAssignmentInfo = await getAssignmentInfo(shipment.assignment_id);
          const courierId = currentAssignmentInfo && currentAssignmentInfo.data && currentAssignmentInfo.data.assignment && currentAssignmentInfo.data.assignment.courier_id;
          if (courierId) {
            msgDSP = `Assignment ${assignmentLabel} (${shipment.assignment_id}) belong to DSP cannot add booking\n`;
          }
        }
        const newAssignmentInfo = await getAssignmentInfo(result.assignment && result.assignment.id);
        const dataAssignmentInfo = newAssignmentInfo && newAssignmentInfo.data && newAssignmentInfo.data.assignment;
        const newCourierId = dataAssignmentInfo && dataAssignmentInfo.courier_id;
        if (newCourierId) {
          msgDSP = `${msgDSP} Assignment ${dataAssignmentInfo.label} (${dataAssignmentInfo.id}) belong to DSP cannot add booking\n`;
        }
      }

      const respCalculdate = await calculatePrice(result.assignment && result.assignment.id);
      if(!respCalculdate) {
        return;
      }
  
      const respAddBooking = await addBooking(result.assignment && result.assignment.id);
      if(!respAddBooking) {
        return;
      }
      
      if (msgDSP) {
        updateStep(3, msgDSP);
      }
      else {
        updateStep(4, '');
      }
      setIsSpliting(false);
    });
  }

  const handleBackStep = (val) => {
    setIsNextStep(val);
    setIsSpliting(val);
    setSteps(cloneDeep(DEFAULT_STEPS));
    setActiveStep(0);
  }

  const handleClose = () => {
    onClose(newAssignmentSplit);
  }

  const { assignment} = selectedAssignment;
  const renderForm = [
    {
      value: newAssignmentLabel,
      onChange: (evt) => handleChange(evt.target.value && evt.target.value.trim().toUpperCase(), setNewAssignmentLabel),
      label: "New Asignment Label",
      componentType: 'textfield',
    }, 
    {
      checkboxes: checkboxes,
      handleChange: (evt) => handleChangeCheckbox(evt, setCheckboxes, checkboxes),
      componentType: 'checkbox',
    }, 
    {
      label: "List Booking",
      value: booking,
      onChange: (evt, val) => handleChange(val, setBooking, FIELD.BOOKING),
      options: optListBooking,
      getOptionLabel: (option) => option.region ? `[${option.region}] ${option.name}` : `${option.name}`,
      getOptionSelected: (option, value) => option.id === value.id,
      disabled: isLoading,
      componentType: 'autocomplete',
    },
    {
      label: "Booking Group",
      value: bookingGroup,
      onChange: (evt, val) => handleChange(val, setBookingGroup, FIELD.BOOKING_GROUP),
      options: booking && booking.groups,
      getOptionLabel: (option) => `${option.name}`,
      getOptionSelected: (option, value) => option.id === value.id,
      componentType: 'autocomplete',
      isHidden: !booking || (booking && booking.type != TYPE.TICKET),
    },
    {
      checkboxes: cbxAddCurrent,
      handleChange: (evt) => handleChangeCheckbox(evt, setCbxAddCurrent, cbxAddCurrent),
      componentType: 'checkbox',
      isHidden: !booking 
                || (currentBookingInfo && booking && currentBookingInfo.booking_session_id === booking.id)
                || (currentBookingInfo && booking && currentBookingInfo.direct_booking_session_id === booking.id),
    },
  ]

  if (!isNextStep) {
    return (
      <Fragment>
        <Grid container spacing={3} style={{padding: '0 16px 0 4px', width: '100%', margin: 0}}>
          <Grid item xs={12} style={{paddingRight: 0}}>
            Do you want to split assignment <strong>{assignment ? assignment.label : ''}</strong> from shipment <strong>{label ? label.driver_label: ''}</strong>?
          </Grid>
          <Grid item xs={12} style={{paddingRight: 0}}>
            <Grid container spacing={1}>
              {renderForm.map((item, idx) => {
                const {fieldName, mdColumn, componentType, type, isHidden,  ...otherProps} = item;
                switch (item.componentType) {
                  case 'autocomplete': 
                    if (isHidden) return null;

                    return (
                      <Grid item xs={12} md={item.mdColumn} key={item.label}>
                        <AxlAutocomplete {...otherProps} />
                      </Grid>
                    )
                  case 'textfield': 
                    return (
                      <Grid item xs={12} md={item.mdColumn} key={item.label}>
                        <AxlTextField {...otherProps} />
                      </Grid>
                    )
                  case 'checkbox': 
                    if (isHidden) return null;

                    return (
                      <Grid item xs={12} md={item.mdColumn} key={idx}>
                        <AxlCheckbox {...otherProps} />
                      </Grid>
                    )
                }
              })}
            </Grid>
          </Grid>
          
        </Grid>
        <Divider style={{marginTop: 16}}/>
        <Box marginY={1} display={'flex'} justifyContent={'flex-end'} paddingX={2}>
          <Button color='primary' size='small' variant='contained' onClick={handleConfirmSpliting}
            disabled={booking && booking.type === TYPE.TICKET && !bookingGroup}
          >Next</Button>
        </Box>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <AxlStepperVertical steps={steps} activeStep={activeStep}/>
      <Divider style={{marginTop: 16}}/>
      <Box display={'flex'} justifyContent={'flex-end'} paddingX={2} marginY={1}>
        {!isSplitSuccess && (
          <Button color='primary' size='small' variant='outlined' onClick={() => handleBackStep(false)} disabled={isSpliting}>Back</Button>
        )}
        {isSplitSuccess && (
          <Button color='primary' size='small' variant='outlined' onClick={() => handleClose()} disabled={isSpliting}>Close</Button>
        )}
      </Box>
    </Fragment>
  )
}

export default SplitRoute