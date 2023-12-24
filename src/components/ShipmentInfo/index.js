import React, { Component, Fragment } from 'react';
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import { AxlPanel, AxlButton, AxlModal, AxlInput, AxlCheckbox, AxlPopConfirm } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import { Box, Tooltip, IconButton, Select, MenuItem, FormControlLabel, Checkbox, TextField, FormControl, InputLabel, Button, CircularProgress } from "@material-ui/core";
import { Edit as EditIcon } from "@material-ui/icons";
import moment from "moment";
import { Route, Switch, withRouter } from "react-router-dom";
import { INBOUND_STATUS_COLOR_CODE } from 'axl-reactjs-ui';
import { reasonCodeDropdown } from './reasonCode'
import { defaultTo, get, isEmpty } from 'lodash'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import DeleteIcon from '@material-ui/icons/Delete';
import HistoryIcon from '@material-ui/icons/History';

// Components
import ShipmentCustomerForm from '../ShipmentCustomerForm/'
import ShipmentPickupForm from '../ShipmentPickupForm/'
import ShipmentDropoffForm from '../ShipmentDropoffForm/'
import ShipmentDropoffDispatchForm from '../ShipmentDropoffDispatchForm/'
import ShipmentPickupInfo from "../ShipmentPickupInfo";
import ShipmentDropoffInfo from "../ShipmentDropoffInfo";
import ShipmentHistoryInfo from "../ShipmentHistoryInfo";
import ShipmentDropoffStatusForm from "../ShipmentDropoffStatusForm";
import PickupRemarkOption from '../PickupStatusForm';
import ShipmentWorkloadInfo from "../ShipmentWorkloadInfo";
import ParcelProvider from '../../providers/Parcel';
import ShipmentPODRequirement from "../ShipmentPODRequirement";
import ShipmentNote from '../ShipmentNote';
import SMSTracking from '../SMSTracking';
import { toast } from "react-toastify";
import SimpleModal from "../SimpleModal";
import withMediaQuery from "../../constants/mediaQuery";
import { MAP_SHIPMENT_STATUS_TO_COLORS } from "../../constants/colors";
import TooltipContainer from '../TooltipContainer';

import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';

import styles, * as E from './styles';
import ShipmentAccessCodeForm from '../ShipmentAccessCodeForm';
import SplitRoute from '../SplitRoute';
import AxlDialog from '../AxlDialog';
import Info from './info';
import DriverAppView from '../DriverAppView';
import { getAppFeatures } from '../../stores/api';

@inject('shipmentStore', 'assignmentStore', 'userStore', 'messengerStore', 'messengerStore', 'permissionStore')
@observer
class ShipmentInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInternalId: false,
      showShipmentCustomerForm: false,
      showPickupInfoForm: false,
      showPickupStatusForm: false,
      showDropoffInfoForm: false,
      showDropoffStatusForm: false,
      showAccessCodeForm: false,
      showHistoryModal: false,
      showInboundNotes: false,
      showEditInbound: false,
      revertDeletedShipment: false,
      showInstructionForm: false,
      shipmentInboundSt: props.shipment.inbound_status,
      updating: false,
      error: '',
      splitAssignmentLabel: '',
      splitRelabelShipment: false,
      reason: "",
      reasonCode: "",
      isSubmitting: false,
      isSpliting: false,
      newAssignment: {},
      isOpenSimulate: false,
      driverAppDropoffInfoSimulation: false,
      shipmentId: null,
      isConfirmDeleteShipment: false,
    }
    this.inboundStatusList = [
      { label: "MISSING", value: "MISSING", color: "red" },
      { label: "RECEIVED_OK", value: "RECEIVED_OK", color: "#3cb371" },
    ];
  }

  componentDidMount() {
    const { assignmentStore, shipmentStore } = this.props;
    assignmentStore.getReasonCodes();
    shipmentStore.getShipmentAddressInfo()
    shipmentStore.getShipmentInfo();
    shipmentStore.getShipmentAnnotation()
  }

  componentDidUpdate() {
    const { shipmentStore, userStore } = this.props;
    const {shipmentInfo} = shipmentStore;
    if(isEmpty(shipmentInfo)) return;

    const { shipment} = shipmentInfo;
    const { shipmentId } = this.state;
    if(shipment && shipment.id !== shipmentId) {
      this.setState({ shipmentId: shipment.id});
      const { user } = userStore;

      getAppFeatures([`US_${user && user.id}`, `RG_${shipment && shipment.region_code}`,'AP_DEFAULT']).then(res => {
        const {driver_app_dropoff_info_simulation} = res.data;
        this.setState({
          driverAppDropoffInfoSimulation: driver_app_dropoff_info_simulation || false
        })
      })
    }
  }

  openForm = (name) => () => {
    const formStateName = `show${name}Form`;
    this.setState({ [formStateName]: true });
  };

  closeForm = (name) => () => {
    const formStateName = `show${name}Form`;
    this.setState({ [formStateName]: false });

    if (name === 'Instruction') {
      const { shipmentStore, shipment } = this.props;
      const { shipmentDropoffForm } = shipmentStore;
      shipmentDropoffForm.setField('dropoff_additional_instruction', shipment.dropoff_additional_instruction);
      shipmentDropoffForm.setField('save_instruction_for_future', false);
    }
  };


  showShipmentDetail = () => {
    // console.log('history is: ', this.props.match.url);
    this.props.history.push(`${this.props.match.url}/edit`)
  };

  onEditShipmentPickup = () => {
    this.props.history.push(`${this.props.match.url}/edit/shipment-pickup`)
  }

  onEditShipmentDropoff = () => {
    this.props.history.push(`${this.props.match.url}/edit/shipment-dropoff`)
  }

  requestSplitRoute = () => {
    this.setState({ showSplitConfirmation: true });
  }

  cancelSplitRoute = () => {
    this.setState({ showSplitConfirmation: false });
  }

  removeShipment = (shipmentId) => {
    const { reason, reasonCode } = this.state;
    const { assignmentStore, history, shipmentStore, messengerStore } = this.props;
    const { topicSelected } = messengerStore;

    if (reasonCode) {
      this.setState({ isSubmitting: true })
      assignmentStore.removeShipment(shipmentId, { reason, reason_code: reasonCode }, (res) => {
        if (res.ok) {
          this.handleConfirmDeleteShipment(false);
          assignmentStore.loadAssignment(assignmentStore.selectedAssignment.assignment.id);
          if (topicSelected) {
            this.props.onRemoveShipment(topicSelected);
          }
          shipmentStore.selectStop(null);
          const { params } = this.props && this.props.match;
          this.props.history.push(params && params["0"])
          toast.success("Removed successfully!", { containerId: 'main' });
        }
        else {
          toast.error(res && res.data && res.data.message || "Error while removing", { containerId: 'main' });
        }

        this.setState({ isSubmitting: false })
      });
    }
  }

  discardStop = (stopId) => {
    const { assignmentStore } = this.props;
    assignmentStore.discardStop(stopId);
  }

  splitRoute = () => {
    this.setState({ isSubmitting: true })
    const { shipment, shipmentStore, assignmentStore, dropoff, history } = this.props;
    const { selectedAssignment } = assignmentStore;
    const assignmentLabel = this.state.splitAssignmentLabel && this.state.splitAssignmentLabel != '' ? this.state.splitAssignmentLabel :
      selectedAssignment && selectedAssignment.assignment ? selectedAssignment.assignment.label : ''

    const data = {
      assignment_label: assignmentLabel,
      relabel_shipment: this.state.splitRelabelShipment
    };


    shipmentStore.splitRoute(shipment.assignment_id, shipment.id, data, (result) => {
      this.setState({ isSubmitting: false })
      if (result.message && result.message.error === 'true') {
        toast.warning(result.message.content, { containerId: 'main' })
      }
      assignmentStore.appendSplitedAssignment(shipment.assignment_id, result.assignment);

      const { history } = this.props;
      const path = history.location.pathname;
      // process to new path
      const newPath = path.replace(/[\d]+\/stops/ig, `${result.assignment.id}/stops`);
      history.push(newPath);
      this.setState({ showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false });
    });
  }

  onChangeAssignmentLabel = (e) => {
    this.setState({ splitAssignmentLabel: e.target.value });
  }

  onChangeRelabelShipment = (e) => {
    this.setState({ splitRelabelShipment: e.target.checked });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.shipment.id !== nextProps.shipment.id) {
      this.setState({ showInboundNotes: false, shipmentInboundSt: nextProps.shipment.inbound_status })
    }
  }

  closeEditInbound = () => {
    this.setState({ showEditInbound: false, error: '', updating: false });
  }

  updateInboundStatus = () => {
    const { revertDeletedShipment, shipmentInboundSt } = this.state;
    const { shipment, shipmentStore } = this.props;

    // no update, just close the popup
    if (shipmentInboundSt === shipment.inbound_status) {
      this.closeEditInbound();
      return;
    }

    this.setState({ updating: true, error: '' });
    shipmentStore.updateInboundStatus(shipment.id, shipmentInboundSt, revertDeletedShipment, res => {
      if (res.ok) {
        this.closeEditInbound();
        shipmentStore.selectShipment(shipment);
      } else {
        this.setState({ error: res.data && res.data.errors ? res.data.errors : res.data.message })
      }
      this.setState({ updating: false });
    });
  }

  handleChangeReasonCode = (e) => {
    this.setState({
      reasonCode: e.target.value
    })
  }

  handleCloseSplit = (newAssignmentData) => {
    const { isSpliting } = this.state;
    if(isSpliting) return;

    if(!newAssignmentData || isEmpty(newAssignmentData)) {
      this.setState({ showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false });
      return;
    }

    const { history } = this.props;
    const path = history.location.pathname;
    const isFromAssignmentDetail = path && path.startsWith('/assignments');
    const newPath = path.replace(/[\d]+\/stops/ig, `${newAssignmentData.id}/stops`);
    if (isFromAssignmentDetail) {
      window.open(newPath, '_self', 'noopener,noreferrer');
    }
    else {
      history.push(newPath);
    }
    this.setState({ showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false })
  }

  handleOpenSimulate = (val) => {
    this.setState({ isOpenSimulate: val})
  }

  handleConfirmDeleteShipment = (val) => {
    this.setState({ 
      reason: "", 
      reasonCode: "", 
      isConfirmDeleteShipment: val 
    });
  }

  render() {
    const {
      showInternalId, showEditInbound, revertDeletedShipment, shipmentInboundSt, updating, error, reason,
      showDropoffInfoForm, showShipmentCustomerForm, showDropoffStatusForm, showPickupStatusForm, showPickupInfoForm,
      showAccessCodeForm, showSplitConfirmation, showInstructionForm, reasonCode, isSubmitting, isSpliting, newAssignment, isOpenSimulate,
      driverAppDropoffInfoSimulation, isConfirmDeleteShipment
    } = this.state;
    const {
      shipment, dropoff, pickup, label, isEdit, stop, assignmentStore, shipmentStore,
      userStore, permissionStore, downloadLabel, mediaQuery, shipmentHistory, refreshNoteTs,
    } = this.props;
    const { selectedAssignment, reasonCodes } = assignmentStore;
    const { splitingRoute, selectedShipmentAssignment, updatePickupStop, updateMultiPickupStop, shipmentInfo } = shipmentStore;
    const { customer } = shipment;
    const inboundStatus = shipment.inbound_status || 'UNSCANNED';
    const inboundStatusColor = INBOUND_STATUS_COLOR_CODE[inboundStatus];
    const currentData = selectedAssignment || selectedShipmentAssignment;
    const isReturnShipment = (shipment && shipment.tags && shipment.tags.includes("RETURN"));
    const isCompleted = currentData && currentData.assignment && currentData.assignment.status === 'COMPLETED';
    const isDelivering = assignmentStore.isDelivering(currentData) && !isCompleted;
    const statusColor = defaultTo(MAP_SHIPMENT_STATUS_TO_COLORS[get(shipment, 'status', null)], '#bebebe');
    const shipmentPickup = {
      title: 'Pickup Info:',
      status: pickup ? pickup.status : null,
      id: shipment.id,
      address: shipment.pickup_address,
      notes: shipment.pickup_note,
      is_cancelled: shipment.is_cancelled,
      remark: pickup ? pickup.remark : '-'
    };
    const calendarStrings = {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'L'
    };
    const isReattemptStop = Boolean(dropoff && dropoff.attributes && dropoff.attributes.is_reattempt === 'true');
    const isPickupFailed = Boolean(pickup && pickup.status === 'FAILED');
    const assignmentLabel = this.state.splitAssignmentLabel && this.state.splitAssignmentLabel != '' ? this.state.splitAssignmentLabel :
      selectedAssignment && selectedAssignment.assignment ? selectedAssignment.assignment.label : ''
    let inboundTs = shipment.inbound_scan_ts || shipment.inbound_lock_ts;
    if (inboundStatus === 'MISSING') {
      if (!shipment.inbound_scan_ts) {
        inboundTs = shipment.inbound_lock_ts;
      } else if (!shipment.inbound_lock_ts) {
        inboundTs = shipment.inbound_scan_ts;
      } else {
        inboundTs = moment(shipment.inbound_lock_ts).isAfter(shipment.inbound_scan_ts) ? shipment.inbound_lock_ts : shipment.inbound_scan_ts;
      }
    }

    const isDeniedEditCustomerInfo = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.EDIT_CUSTOMER_INFO);
    const findReasonCode = reasonCodes && reasonCodes.find(r => r.type === reasonCode);
    const isTextField = findReasonCode && findReasonCode.is_text_field || false;
    const { client, client_profile: clientProfile } = shipmentInfo;
    const useDifferentBrand = clientProfile && client && clientProfile.name !== client.company;
    const driverId = selectedAssignment && selectedAssignment.assignment && selectedAssignment.assignment.driver_id;

    return shipmentStore.loadingAddressInfo ? <CircularProgress style={{position:'absolute', top:'50%', left:'50%'}} /> :
      <AxlPanel style={styles.container}>
        <AxlPanel.Row col={true} style={{ width: '100%', height: '100%' }}>
          <AxlPanel.Col flex={0} style={{ padding: '15px 20px 0' }}>
            <AxlPanel.Row>
              <Box>
                <div style={styles.inboundInfo}>
                  <span>Inbound Status:</span>
                  {inboundStatus === 'MISSING' && (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => this.setState({ showEditInbound: true, shipmentInboundSt: inboundStatus })} size="small" style={{ fontSize: 13, marginLeft: 3 }} disableRipple disableFocusRipple>
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                <div style={{ ...styles.status, cursor: 'pointer', color: inboundStatusColor, textDecoration: this.state.showInboundNotes ? 'none' : 'underline' }}
                  onClick={() => this.setState({ showInboundNotes: !this.state.showInboundNotes })}
                >
                  {inboundStatus.replace(/[_-]/g, " ")}
                </div>
                {this.state.showInboundNotes && (
                  <Fragment>
                    <div style={{ ...styles.status, color: inboundStatusColor }}>{shipment.inbound_notes}</div>
                    {inboundTs && <div style={{ ...styles.status, color: inboundStatusColor }}><Moment interval={0} calendar={calendarStrings}>{inboundTs}</Moment></div>}
                  </Fragment>
                )}
              </Box>
              <Box textAlign={'center'} px={1.875} position={'relative'} zIndex={1} flex={1}>
                <div style={styles.name} data-testid="shipment-info-name">{label ? label.driver_label + ': ' : ' '}{customer ? customer.name : ''}</div>
                <div style={styles.company} data-testid="shipment-info-id"><code style={styles.code}>{shipment.id}</code></div>
              </Box>
              <Box position={'relative'} zIndex={1} textAlign={'righr'} display={'flex'} alignItems={'center'} justifyContent={'flex-end'} flexWrap={'wrap'} flex={'0 0 75px'} style={{ gap: 4}}>
                {shipment.id && <SMSTracking shipmentId={shipment.id} />}
                {shipmentHistory && <Tooltip title="View shipment history">
                  <span>
                    <IconButton size='small' onClick={() => this.setState({ showHistoryModal: !this.state.showHistoryModal })} data-testid="shipment-info-history-shipment-button"><HistoryIcon/></IconButton>
                  </span>
                </Tooltip>}
                {isReattemptStop && isPickupFailed && (
                  <AxlPopConfirm
                    trigger={<Tooltip title="Discard stop"><span><AxlButton bg={`gray`} compact ico={{ className: 'fa fa-times' }} /></span></Tooltip>}
                    titleFormat={<div>Discard this stop?</div>}
                    textFormat={<div><strong>Please confirm that you want to discard this stop!</strong></div>}
                    okText={`CONFIRM`}
                    onOk={() => this.discardStop(dropoff.id)}
                    cancelText={`CANCEL`}
                    onCancel={() => console.log('onCancel')}
                  />
                )}
                {driverId && driverAppDropoffInfoSimulation && (
                  <Tooltip title="Show what driver see in their app">
                    <span>
                      <IconButton size='small' onClick={() => this.handleOpenSimulate(true)} style={{padding: 0}}><SmartphoneIcon/></IconButton>
                    </span>
                  </Tooltip>
                )}
                {selectedAssignment && !isReturnShipment && (
                  <Tooltip title="Remove from route">
                    <IconButton size='small' onClick={() => this.handleConfirmDeleteShipment(true)}><DeleteIcon/></IconButton>
                  </Tooltip>
                )}
              </Box>
            </AxlPanel.Row>
            <AxlPanel.Row><div style={styles.inboundInfo}>Status: <span style={{ color: statusColor }} data-testid="shipment-info-status">{shipment.status}</span></div></AxlPanel.Row>
          </AxlPanel.Col>
          <div style={{ position: 'relative', flex: 1, marginTop: 5 }}>
            {!this.state.showHistoryModal ? <div>
              <Box flex={1} px={2.5}>
                <Box display={'flex'} style={{gap: 16}} justifyContent={'space-between'} mb={2} mt={0.5}>
                  <Info label={'Client Info:'}>
                    <Box display={'flex'}>
                      {client && client.logo_url && 
                        <Box width={32}>
                          <img src={`${client.logo_url}`} style={styles.logo} />
                        </Box>
                      }
                      <Box ml={client && client.logo_url ? 0.5 : 0} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                        <Box>{client ? client.company : '-'}</Box>
                        { useDifferentBrand && <Box color={'#6c62f5'} alignItems={'flex-start'} display={'flex'}>
                          {(clientProfile.is_use_profile_name || clientProfile.is_use_profile_logo) && <Tooltip title={
                            clientProfile.is_use_profile_name && clientProfile.is_use_profile_logo 
                            ? "Brand name and logo show to customer"
                            : clientProfile.is_use_profile_name ? "Brand name show to customer" 
                            : clientProfile.is_use_profile_logo ? "Brand logo show to customer" : ""

                          }>
                            <CheckCircleIcon htmlColor='#6c62f5' style={{fontSize: 14, marginRight: 4}}/>
                          </Tooltip>}<i>{`${clientProfile.name} brand`}</i>
                        </Box>}
                        {shipment.internal_id && <div>
                          {!showInternalId && (
                            <div>
                              <span style={styles.showLink} onClick={() => this.setState({ showInternalId: true })}>{`Show internal ID`}</span>
                            </div>
                          )}
                          {showInternalId && <div style={styles.company}>{shipment.internal_id}</div>}
                        </div>}
                      </Box>
                    </Box>
                  </Info>
                  <Info label={'Customer Info:'}>
                    <Box display={'flex'} flexDirection={'row'}>
                      <Box display={'flex'} flexDirection={'column'}>
                        <Box>{customer.phone_number}</Box>
                        <Box>{customer.email ? customer.email : ''}</Box>
                      </Box>
                    </Box>
                  </Info>

                  <Info>
                    <Box>
                      {isEdit && !dropoff._deleted && (
                        <TooltipContainer title={isDeniedEditCustomerInfo ? PERMISSION_DENIED_TEXT : ''}>
                          <AxlButton disabled={isDeniedEditCustomerInfo} tiny bg={`none`} onClick={this.openForm('ShipmentCustomer')}>
                            Edit
                          </AxlButton>
                        </TooltipContainer>
                      )}
                    </Box>
                  </Info>
                </Box>
                <ShipmentPODRequirement shipment={shipment} />
                <ShipmentNote shipmentId={shipment.id} userId={userStore.user.id} refreshNoteTs={refreshNoteTs} />
                <ParcelProvider><ShipmentWorkloadInfo shipmentId={shipment.id} workload={shipment.workload} downloadLabel={downloadLabel}></ShipmentWorkloadInfo></ParcelProvider>
                <ShipmentPickupInfo pickup={pickup} dropoff={dropoff} shipment={shipment} openForm={this.openForm} isEdit={this.props.isEdit} />
                <ShipmentDropoffInfo pickup={pickup} dropoff={dropoff} shipment={shipment} closeForm={this.closeForm} openForm={this.openForm} isOpen isEdit={this.props.isEdit} />
              </Box>
            </div> : <E.HistoryInfoContainer>
              <ShipmentHistoryInfo shipment={shipment} shipmentHistory={this.props.shipmentHistory} isOpen />
            </E.HistoryInfoContainer>}
          </div>
        </AxlPanel.Row>

        {showShipmentCustomerForm && <AxlModal onClose={this.closeForm('ShipmentCustomer')} style={styles.shipmentDetailModal}>
          <ShipmentCustomerForm shipment={shipment} dropoff={dropoff} closeForm={this.closeForm('ShipmentCustomer')} />
        </AxlModal>}

        {showDropoffInfoForm && (
          <SimpleModal
            open={showDropoffInfoForm}
            title=""
            minWidth={200}
            maxWidth={mediaQuery.isDownMD ? false : "md"}
            onClose={this.closeForm('DropoffInfo')}
            fullScreen={mediaQuery.isDownMD}
          >
            <ShipmentDropoffForm shipment={shipment} dropoff={dropoff} closeForm={this.closeForm('DropoffInfo')} />
          </SimpleModal>
        )}

        {showDropoffStatusForm && <AxlModal onClose={this.closeForm('DropoffStatus')} style={styles.shipmentDetailModal}>
          <ShipmentDropoffStatusForm shipment={shipment} dropoff={dropoff} closeForm={this.closeForm('DropoffStatus')} />
        </AxlModal>}

        {this.state.showPickupStatusForm && (<PickupRemarkOption
          pickup={pickup}
          shipmentStore={shipmentStore}
          assignmentStore={assignmentStore}
          closeForm={this.closeForm('PickupStatus')}
          style={styles.shipmentDetailModal}
        />)}

        {showPickupInfoForm && <AxlModal onClose={this.closeForm('PickupInfo')} style={styles.shipmentDetailModal}>
          <ShipmentPickupForm shipment={shipment} pickup={pickup} dropoff={dropoff} closeForm={this.closeForm('PickupInfo')} />
        </AxlModal>}

        {showInstructionForm && <AxlModal onClose={this.closeForm('Instruction')} style={styles.shipmentDetailModal}>
          <ShipmentDropoffDispatchForm shipment={shipment} pickup={pickup} dropoff={dropoff} closeForm={this.closeForm('Instruction')} />
        </AxlModal>}

        {showAccessCodeForm && <AxlModal onClose={this.closeForm('AccessCode')} style={styles.shipmentDetailModal}>
          <ShipmentAccessCodeForm shipment={shipment} pickup={pickup} dropoff={dropoff} closeForm={this.closeForm('AccessCode')} />
        </AxlModal>}

            {showSplitConfirmation && 
              <AxlDialog
                isOpen={showSplitConfirmation}
                childrenTitle={'Split confirmation'}
                children={
                  <SplitRoute 
                    selectedAssignment={selectedAssignment} 
                    label={label} 
                    assignmentLabel={assignmentLabel}
                    setIsSpliting={(val) => this.setState({ isSpliting: val})}
                    shipment={shipment}
                    shipmentStore={shipmentStore}
                    assignmentStore={assignmentStore}
                    onClose={(data) => this.handleCloseSplit(data)}
                    isSpliting={isSpliting}
                    setNewAssignment={(data) => this.setState({ newAssignment: data || {}})}
                  />
                }
                handleClose={() => this.handleCloseSplit(newAssignment)}
                DialogContentProps={{style: {padding: '16px 0 0'}}}
              />
            }

        {showEditInbound && (
          <AxlModal onClose={this.closeEditInbound} style={{ width: 600, fontFamily: 'AvenirNext' }}>
            <Box px={3} pb={3} mt={2}>
              <Box component="h3" m={0} py={1} style={{ fontSize: '1.5em', fontFamily: 'AvenirNext-Medium' }}>
                Edit Inbound Status
              </Box>
              <Box pt={2}>
                <Select
                  variant="outlined"
                  fullWidth
                  disabled={updating || isDelivering}
                  value={shipmentInboundSt}
                  onChange={e => this.setState({ shipmentInboundSt: e.target.value })}
                  renderValue={vl => <span style={{ color: this.inboundStatusList.filter(st => st.value === vl).pop().color }}>{vl}</span>}
                >
                  {this.inboundStatusList.map(st => (
                    <MenuItem value={st.value} style={{ color: st.color }}>{st.label}</MenuItem>
                  ))}
                </Select>
                <Box py={1}>
                  <FormControlLabel
                    control={<Checkbox disabled={updating || isDelivering || isCompleted} checked={revertDeletedShipment} onChange={(e) => this.setState({ revertDeletedShipment: e.target.checked })} color="secondary" />}
                    label={`Revert discarded shipment ${label ? label.driver_label : ''} to current assignment ${currentData && currentData.assignment ? currentData.assignment.label : ""}`}
                  />
                </Box>
              </Box>
              {assignmentStore.isPickedUpAlready() && revertDeletedShipment && (
                <Box p={2} mb={2} style={{ border: 'solid 1px #a32', backgroundColor: '#fff4f4', borderRadius: 6, textAlign: 'center' }}>
                  Assignment has been picked already, revert discarded shipment may force driver to go back to warehouse to pick up the box.
                  Please make sure you want to do that.
                </Box>
              )}
              {isDelivering && (
                <Box p={2} mb={2} style={{ border: 'solid 1px #a32', backgroundColor: '#fff4f4', borderRadius: 6, textAlign: 'center' }}>
                  Cannot update inbound while assignment is delivering, please use outbound app.
                </Box>
              )}
              <Box align="right">
                <AxlButton bg={'white'} compact style={{ width: 130 }}
                  onClick={this.closeEditInbound}
                >
                  Cancel
                </AxlButton>
                <AxlButton loading={updating} disabled={updating || isDelivering}
                  compact style={{ width: 130 }}
                  onClick={this.updateInboundStatus}
                >
                  Save
                </AxlButton>
              </Box>
              {error && <Box align="center" pt={2} style={{ color: 'red', fontSize: 14 }}>{error}</Box>}
            </Box>
          </AxlModal>
        )}

        {isOpenSimulate && driverId && (
          <AxlDialog
            isOpen={isOpenSimulate}
            childrenTitle={"Driver App View"}
            handleClose={() => this.handleOpenSimulate(false)}
            children={<DriverAppView shipmentId={shipment.id} driverId={driverId} assignmentId={selectedAssignment && selectedAssignment.assignment && selectedAssignment.assignment.id}/>}
            maxWidth='xs'
          />
        )}

        {isConfirmDeleteShipment && (
          <AxlDialog
            isOpen={isConfirmDeleteShipment}
            maxWidth='sm'
            childrenTitle={"Remove Shipment from Assignment"}
            handleClose={() => this.handleConfirmDeleteShipment(false)}
            children={
              <Box textAlign={'center'}>
                <span>Please confirm you want to re-move this shipment from this route!</span>
                <br />
                <strong style={{ color: '#422' }}>It will affect the ETA as well as pay-rate of the assignment!</strong>
                <br />
                <FormControl variant="outlined" fullWidth margin='normal' size='small' style={styles.formControl}>
                  <InputLabel id="reason-code-label-id">Reason code</InputLabel>
                  <Select
                    labelId="reason-code-label-id"
                    id="reason-code-id"
                    value={reasonCode}
                    onChange={this.handleChangeReasonCode}
                    label="Reason code"
                    fullWidth
                  >
                  {
                    reasonCodes && reasonCodes.map(item => <MenuItem key={item.type} value={item.type}>{item.title}</MenuItem>)
                  }
                  </Select>
                </FormControl>
                {
                  isTextField && (<TextField value={reason} onChange={e => this.setState({ reason: e.target.value })} label="Reason" variant="outlined" margin="dense" fullWidth />)
                }
              </Box>
            }
            childrenAction={<Box display={'flex'} justifyContent={'flex-end'} style={{gap: 8}}>
              <Button 
                variant='outlined' 
                onClick={() => this.handleConfirmDeleteShipment(false)} 
                disabled={isSubmitting} 
                size='small'
                style={{color: '#aaa'}}
              >CANCEL</Button>
              <Button 
                variant='contained' 
                color='primary' 
                disabled={!reasonCode || (isTextField && (!reason || !reason.trim())) || isSubmitting} 
                onClick={() => this.removeShipment(shipment.id)} 
                size='small'
              >
                {isSubmitting ? <CircularProgress size={20}/> : `CONFIRM`}
              </Button>
            </Box>}
          />
        )}
      </AxlPanel>
  }
}

ShipmentInfo.defaultProps = {
  isEdit: true
}

ShipmentInfo.propTypes = {
  isEdit: PropTypes.bool
}

export default withRouter(withMediaQuery()(ShipmentInfo));
