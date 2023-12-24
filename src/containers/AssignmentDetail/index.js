import React, { Component, Fragment } from 'react';
import DriverInfoCard from '../../components/DriverInfoCard/index';
import {
    AxlButton, AxlModal, AxlPanel, AxlPopConfirm, AxlPanelSlider, AxlDateInput,
    STATUS_COLOR_CODE, AxlInput, AxlCheckbox, AxlTextArea, AxlLoading
} from 'axl-reactjs-ui';
import DriverSearch from '../DriverSearch/index';
import { inject, observer } from 'mobx-react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import moment from "moment-timezone";
import _ from 'lodash';
import { Box, Tooltip, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, ButtonGroup, Button, IconButton, CircularProgress, TextField, Grid, Checkbox, FormControlLabel, Typography, RadioGroup, Radio, FormControl, Select, MenuItem, Modal, ButtonBase, Icon } from "@material-ui/core";
import {
    NavigateNext as NavigateNextIcon, NavigateBefore as NavigateBeforeIcon, Home as HomeIcon, AssignmentReturn
} from '@material-ui/icons';
import {Autocomplete} from '@material-ui/lab';

import { toast } from 'react-toastify';

// Components
import AssignmentBonus from '../../components/AssignmentBonus';
import AssignmentMessagePool from '../../components/AssignmentMessagePool';
import AssignmentNote from '../../components/AssignmentNote';
import AssignmentNotd from '../../components/AssignmentNotd';
import AssignmentFeedback from '../../components/AssignmentFeedback';
import AssignmentSMS from '../../components/AssignmentSMS';
import ReorderShipment from '../../components/ReorderShipment';
import Geofencing from '../../components/Geofencing';
import Eta from './eta'
import TimeWindowWithZone from "../../components/TimeWindowWithZone";
import DspSearch from "../DspSearch";
import SimpleModal from "../../components/SimpleModal";
import DialogSMSCost from '../../components/DialogSMSCost';
import AssignmentComplete from '../../components/AssignmentComplete';
import TooltipContainer from '../../components/TooltipContainer';

import styles, * as E from './styles';
import { toastMessage } from '../../constants/toastMessage';
import { ACTIONS } from '../../constants/ActionPattern';
import { convertMeterToMile, ASSIGN_BTN_TEXT, REASSIGN_BTN_TEXT, DRIVER_SEARCH_ASSIGNMENT, PERMISSION_DENIED_TEXT } from '../../constants/common';
import AxlDialog from '../../components/AxlDialog';

const DELAY_REASON = [
  { key: 'BAD_WEATHER', label: 'Bad weather' },
  { key: 'DELIVERY_ISSUE', label: 'A delivery issue' },
  { key: 'LOCAL_EVENT', label: 'A local event' },
  { key: 'ROAD_CLOSURES', label: 'Road closures' },
  { key: 'OTHER', label: 'Other' },
];

@inject('assignmentStore', 'userStore', 'messengerStore', 'driverStore', 'etaStore', 'clientStore', 'geocodeAddressListStore', 'permissionStore')
@observer
class AssignmentDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showDriverSearch: false,
            showHistoryModal: false,
            showAddShipment: false,
            showAssignmentBonus: false,
            confirmationBox: {
              title: 'Confirmation',
              description: 'blah blah',
              action: () => {}
            },
            showConfirmationActivateBox: false,
            showMessagePoolModal: false,
            showExtraAssignmentInfo: false,
            requestDeleteAssignment: false,
            deleteAssignmentReason: '',
            deleteAssignmentError: '',
            showMoveAssignmentBox: false,
            selectedTab: 'driver',
            moveHour: null,
            showUpdatePickupBox: false,
            updateWarehouseId: null,
            isShowFeedBackModal: false,
            isShowRemoveModal: false,
            notifyBySMS: true,
            markRolled: true,
            notifyByEmail: false,
            isShowRiskyModal: false,
            warehouseInfo: null,
            pickupAddressType: 'warehouse',
            street: '',
            city: '',
            state: '',
            zipcode: '',
            latitude: '-',
            longitude: '-',
            geocoding: false,
            geocodeErrorMsg: '',
            isRefreshPricing: true,
            refreshNoteTs: undefined,
            delayReason: 'OTHER',
            isMoveToNextDay: false,
            messageAddReturnStop: false,
            spin:false,
            isOpenDeactiveOrActive: false,
            isSaving: false,
        }
        this.onAssignDriver = this.onAssignDriver.bind(this);
        this.onUnAssignDriver = this.onUnAssignDriver.bind(this);
        this.onActivate = this.onActivate.bind(this);
        this.onDeActivate = this.onDeActivate.bind(this);
        this.showDriverSearch = this.showDriverSearch.bind(this);
        this.hideDriverSearch = this.hideDriverSearch.bind(this);
        this.showAssignmentbonus = this.showAssignmentbonus.bind(this);
        this.hideAssignmentbonus = this.hideAssignmentbonus.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onEtaUpdated = this.onEtaUpdated.bind(this);
    }

    onEtaUpdated(assignmentId, eta) {
        const { assignmentStore } = this.props
        assignmentStore.updateAssignmentEta(assignmentId, eta)
    }

    onAssignDriver(d, reason) {
        const { assignmentStore, assignmentInfo, messengerStore } = this.props;
        const { assignmentSummeries } = assignmentStore;
        const topicSelectedId = (assignmentSummeries[assignmentInfo.assignment.id] && assignmentSummeries[assignmentInfo.assignment.id].topic_id) || null;

        if (assignmentInfo.assignment.driver_id) {  // Reassign driver
            assignmentStore.reassign(this.props.assignmentInfo, d, reason).then((r) => {
                this.setState({showDriverSearch: false});
                assignmentStore.loadAssignments();
                assignmentStore.loadAssignment(assignmentStore.selectedAssignmentId);
                if(this.props.assignmentInfo.assignment && this.props.assignmentInfo.assignment.driver_id) {
                    if(topicSelectedId) {
                        messengerStore.topicSelectedId = topicSelectedId;
                        // unfollow current driver then follow new driver to the topic
                        messengerStore.driverUnfollow([assignmentInfo.assignment.driver_id], () => {
                            messengerStore.driverFollow([d.id]);
                        });
                    }
                }
                if (r && !r.ok) {
                  toast.error(r && r.data && r.data.message || 'Fail to reassign route', {containerId: 'main'});
                }
            })
        } else {    // Assign driver
            assignmentStore.assign(this.props.assignmentInfo, d, reason).then((r) => {
                this.setState({showDriverSearch: false});
                assignmentStore.loadAssignments();
                assignmentStore.loadAssignment(assignmentStore.selectedAssignmentId);
                // follow driver into a topic
                if(topicSelectedId) {
                    messengerStore.topicSelectedId = topicSelectedId;
                    this.props.messengerStore.driverFollow([d.id]);
                }
                if(r && !r.ok) {
                    toast.error(r && r.data && r.data.message || toastMessage.ERROR_SAVING, {containerId: 'main'});
                }
            })
        }
    }

    onUnAssignDriver(reason) {
        const { assignmentStore, assignmentInfo, messengerStore } = this.props;
        const { assignmentSummeries } = assignmentStore;
        const topicSelectedId = (assignmentSummeries[assignmentInfo.assignment.id] && assignmentSummeries[assignmentInfo.assignment.id].topic_id) || null;

        assignmentStore.unassign(this.props.assignmentInfo, reason).then((r) => {
            assignmentStore.loadAssignments();
            assignmentStore.loadAssignment(assignmentStore.selectedAssignmentId);
            // unfollow driver into a topic
            if(this.props.assignmentInfo.assignment && this.props.assignmentInfo.assignment.driver_id) {
                if(topicSelectedId) {
                    messengerStore.topicSelectedId = topicSelectedId;
                    this.props.messengerStore.driverUnfollow(this.props.assignmentInfo.assignment.driver_id);
                }
            }
        })
    }

    onAssignDsp = (dsp, reason) => {
        const { assignmentStore, assignmentInfo } = this.props;
        assignmentStore.assignDsp(assignmentInfo, dsp, reason).then((r) => {
            this.setState({showDriverSearch: false});
            assignmentStore.loadAssignments();
            assignmentStore.loadAssignment(assignmentStore.selectedAssignmentId);
        })
    };

    onUnAssignDsp = (reason) => {
        const { assignmentStore, assignmentInfo } = this.props;
        assignmentStore.unassignDsp(assignmentInfo, reason).then((r) => {
            assignmentStore.loadAssignments();
            assignmentStore.loadAssignment(assignmentStore.selectedAssignmentId);
        })
    };

    onShowUnAssignConfirmation() {
        this.setState({
            showConfirmationBox: true,
            confirmationBox: {
              title: 'Unassign Driver',
              description: 'Please confirm you want to unassign driver from selected Assignment!',
              action: this.onUnAssignDriver
            }
        })
    }

    onActivate() {
        const { assignmentStore } = this.props
        this.setState({ isSaving: true});
        assignmentStore.activate(this.props.assignmentInfo.assignment, (r) => {
          this.setState({ isSaving: false});
            if(!r.ok) {
              toast.error(r.data && r.data.message || 'Fail to activate assignment!', {containerId: 'main'});
            } else {
              toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
              this.setState({ isOpenDeactiveOrActive: false});
              assignmentStore.loadAssignments();
            }
        })
    }

    onComplete() {
        const { assignmentStore } = this.props
        assignmentStore.complete(this.props.assignmentInfo.assignment)
    }

    onDeActivate() {
        const { assignmentStore } = this.props
        this.setState({ isSaving: true});
        assignmentStore.deactivate(this.props.assignmentInfo.assignment).then((r) => {
          this.setState({ isSaving: false});
          assignmentStore.loadAssignments();
          if (r.ok) {
            toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
            this.setState({ isOpenDeactiveOrActive: false});
          }
          else {
            toast.error(r.data && r.data.message || 'Fail to deactivate assignment!', {containerId: 'main'});
          }
        })
    }

    showDriverSearch = () => { this.setState({showDriverSearch: true}) }

    hideDriverSearch = () => { this.setState({showDriverSearch: false}) }

    showAssignmentbonus = () => { this.setState({showAssignmentBonus: true}) }

    hideAssignmentbonus = () => { this.setState({showAssignmentBonus: false}) }

    showMessagePool = () => { this.setState({showMessagePoolModal: true}) }

    hideMessagePool = () => { this.setState({showMessagePoolModal: false}) }

    showFeedBackModal = () => { this.setState({isShowFeedBackModal: true}) }

    hideFeedBackModal = () => { this.setState({isShowFeedBackModal: false}) }

    hideRemoveModal = () => { this.setState({isShowRemoveModal: false}) }

    hideRiskyModal = () => { this.setState({isShowRiskyModal: false}) }

    showMessageAddReturnStop = () => { this.setState({messageAddReturnStop: true}) }

    hideMessageAddReturnStop = () => { this.setState({messageAddReturnStop: false}) }

    addShipment = (assignment, shipmentId) => {
      const { assignmentStore } = this.props;
      assignmentStore.addShipment(assignment, shipmentId, true, (stops) => {
          this.setState({showAddShipment: false})
      })
    };

    cancelAddShipment = (e) => {
      this.setState({showAddShipment: false});
    };


    displayAssignmentExtraInfo = () => {
        this.setState({showExtraAssignmentInfo: true});
    }

    closeAssignmentExtraInfo = () => {
        this.setState({
            showExtraAssignmentInfo: false,
            requestDeleteAssignment: false,
            deleteAssignmentReason: '',
            deleteAssignmentError: '',
            requestRestoreDeletedAssignment: false,
            restoreDeletedAssignmentReason: ''
        });
    }

    // pickup warehouse update
    displayUpdatePickupBox = (e) => {
        const { assignmentInfo, assignmentStore} = this.props;
        assignmentStore.isShowWarehouseInfo = false;
        this.setState({warehouses: null, updateWarehouseId: null});
        if (assignmentInfo && assignmentInfo.assignment) {
            assignmentStore.getWarehouses(assignmentInfo.assignment.id).then(resp => {
                if (resp.ok) {
                    this.setState({warehouses: resp.data});
                }
            });
        }

        this.setState({showUpdatePickupBox: true, updateWarehouseId: null});

        if(assignmentStore && assignmentStore.selectedAssignment && assignmentStore.selectedAssignment.assignment && assignmentStore.selectedAssignment.assignment.warehouse_id) {
            const findWarehouse = assignmentStore.warehouses.find(f => f.id == assignmentStore.selectedAssignment.assignment.warehouse_id);
            this.setState({warehouseInfo: findWarehouse})
        }

        this.setState({
            pickupAddressType: "warehouse",
            street: '',
            city: '',
            state: '',
            zipcode: '',
            latitude: '-',
            longitude: '-',
            geocoding: false,
            geocodeErrorMsg: '',
            isRefreshPricing: true,
        })
    }

    updateAssignmentPickup = () => {
        const { assignmentInfo, assignmentStore} = this.props;
        this.setState({updatingPickup: true});
        const { pickupAddressType, isRefreshPricing, street, city, state, zipcode, latitude, longitude } = this.state;
        if(pickupAddressType === 'customAddress') {
            const data = {
                street,
                city,
                state,
                zipcode,
                lat: latitude,
                lng: longitude
            }
            assignmentStore.updateAddressPickup(assignmentInfo.assignment.id, isRefreshPricing, data).then(res => {
                if(res.ok) {
                    this.setState({showUpdatePickupBox: false, warehouseInfo: null });
                    const {shipments} = assignmentInfo;
                    shipments && shipments.forEach(s => {
                        s['pickup_address'] = data;
                        s['warehouse_id'] = null;
                    });
                    assignmentStore.selectedAssignment.assignment.warehouse_id = null;
                    toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
                }
                else {
                    toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
                }
                this.setState({updatingPickup: false});
            })
            return;
        }

        if (assignmentInfo && assignmentInfo.assignment) {
            assignmentStore.updateWarehouse(assignmentInfo.assignment.id, this.state.updateWarehouseId).then(resp => {
                if (resp.ok) {
                    if(assignmentStore && assignmentStore.warehouses && this.state.updateWarehouseId) {
                        assignmentStore.selectedAssignment.assignment.warehouse_id = this.state.updateWarehouseId
                        const isExistWarehouse = assignmentStore.warehouses.some(f => f.id == this.state.updateWarehouseId);
                        if(!isExistWarehouse) {
                            const findWarehouse = this.state.warehouses.find(f => f. id == this.state.updateWarehouseId);
                            assignmentStore.warehouses.push(findWarehouse)
                        }
                    }
                    this.setState({showUpdatePickupBox: false, updateWarehouseId: null, warehouses: null});
                }

                this.setState({updatingPickup: false});
            });
        }
    }

    closeUpdatePickupBox = () => {
        this.setState({showUpdatePickupBox: false, updateWarehouseId: null});
    }

    // move assignment
    displayMoveAssignmentBox = (hour) => () => {
      const isMoveToNextDay = hour > 0;
      const smsContent = isMoveToNextDay ? this.generateSmsContent() : "We were unable to deliver your package and will reattempt delivery tomorrow. Here's your tracking link: ${tracking_link}";

      this.setState({
        showMoveAssignmentBox: true,
        moveHour: hour,
        moveAssignmentReason: '',
        notifyBySMS: true,
        moveAssignmentSMS: smsContent,
        isMoveToNextDay: isMoveToNextDay,
      });
    }

    closeMoveAssignmentBox = () => {
      this.setState({ showMoveAssignmentBox: false, moveHour: null, moveAssignmentReason: '', delayReason: 'OTHER', isMoveToNextDay: false, notifyByEmail: false });
    }

    requestDeleteAssignment = () => {
        this.setState({requestDeleteAssignment: true});
    }

    requestRestoreDeletedAssignment = () => {
        this.setState({requestRestoreDeletedAssignment: true});
    }

    changeDeleteAssignmentReason = (e) => {
        this.setState({deleteAssignmentReason: e.target.value});
    }

    changeRestoreDeletedAssignmentReason = (e) => {
        this.setState({restoreDeletedAssignmentReason: e.target.value});
    }

    generateSmsContent = (reason = '') => {
      const text = reason !== 'OTHER' ? reason.toLowerCase() : '';
      const content = 'Your delivery is delayed due to $reason. We will reattempt delivery tomorrow. Track your updates here: ${tracking_link}';

      return content.replace('$reason', text);
    };

    changeMoveAssignmentSMS = (e) => {
        this.setState({moveAssignmentSMS: e.target.value});
    }

    // changeWarehouse = (e) => {
    //     console.log('value is: ', e.target.value);
    //     this.setState({updateWarehouseId: e.target.value});
    // }

    changeWarehouse = (e, v, r) => {
        console.log('changed is: ', e.target.value, v, r);
        this.setState({updateWarehouseId: v.id});
    }

    deleteAssignment = (e) => {
        const { assignmentInfo, assignmentStore, history} = this.props;
        if (!assignmentInfo || !assignmentInfo.assignment || this.state.deleteAssignmentReason.trim() === '') return;

        assignmentStore.softDeleteAssignment(assignmentInfo.assignment.id, this.state.deleteAssignmentReason, () => {
            if (history && history.location && history.location.pathname) {
                history.push(history.location.pathname.replace(/\/[\d]+$/gi, ""));
            }
            this.closeAssignmentExtraInfo(e);
        }, (resp) => {
            this.setState({deleteAssignmentError: resp.data.message});
        })
    }

    clearSMSCost = () => {
        this.setState({ SMSCost: null })
    }

    changeMoveAssignmentHour = (date, originDate) => {
        const diffHour = Math.round(moment(date).diff(originDate)/(3600 * 1000));
        this.setState({moveHour: diffHour});
    }

    handleChangeDelayReason = (e, v) => {
        const reasonCode = v.props.value;
        const reason = v.props.reason;
        const smsContent = this.generateSmsContent(reason);

        this.setState({ delayReason: reasonCode, moveAssignmentReason: reasonCode === 'OTHER' ? '' : reason, moveAssignmentSMS: smsContent });
    };

    changeMoveAssignmentReason = (e) => {
        const reason = e.target.value;
        if (reason.length > 255) return;

        const smsContent = this.generateSmsContent(reason);
        const { isMoveToNextDay } = this.state;
        const params = isMoveToNextDay ? { moveAssignmentReason: reason, moveAssignmentSMS: smsContent } : { moveAssignmentReason: reason };

        this.setState(params);
    }

    moveAssignmentDate = (e) => {
        const { moveAssignmentReason, moveAssignmentSMS, notifyBySMS, moveHour, markRolled, notifyByEmail, isMoveToNextDay, delayReason } = this.state;
        const { assignmentInfo, assignmentStore, history } = this.props;
        if (!assignmentInfo || !assignmentInfo.assignment || moveAssignmentReason.trim() === '') return;

        if (!moveHour) {
            this.closeMoveAssignmentBox(e);
            return;
        }

        const hour = moveHour ? parseInt(moveHour) : 24;
        const params = { hour, reason_code: delayReason, reason: moveAssignmentReason, notify_customer: notifyBySMS, sms: moveAssignmentSMS, mark_rolled: markRolled };
        if (isMoveToNextDay) params.is_need_review = notifyByEmail;

        assignmentStore.moveAssignmentDate(assignmentInfo.assignment.id, params, () => {
            if (history && history.location && history.location.pathname && history.location.pathname.indexOf('routes') > 0) {
                history.push(history.location.pathname.replace(/\/[\d]+$/gi, ""));
            }
            this.closeMoveAssignmentBox(e);
        }, (resp) => {
            this.setState({ moveAssignmentError: resp.data.message });
        });
    }

    getEstimatedSMSCost = () => {
        const {moveAssignmentReason, moveAssignmentSMS, notifyBySMS, moveHour, markRolled} = this.state;
        const { assignmentInfo, assignmentStore, history} = this.props;
        if (notifyBySMS) {
          assignmentStore.getEstimatedCostSMSmoveDate(assignmentInfo.assignment.id,
            {sms: moveAssignmentSMS}).then(res => {
            if (res.ok) this.setState({ SMSCost: res.data });
          });
        } else {
          this.moveAssignmentDate();
        }
    }

    restoreAssignment = (e) => {
        const { assignmentInfo, assignmentStore} = this.props;
        if (!assignmentInfo || !assignmentInfo.assignment || this.state.restoreDeletedAssignmentReason.trim() === '') return;

        assignmentStore.restoreAssignment(assignmentInfo.assignment.id, this.state.restoreDeletedAssignmentReason, () => {
            this.closeAssignmentExtraInfo(e);
        })
    }

    onRemoveRiskyAssignment(assignmentId) {
        const {assignmentStore} = this.props;
        const result = assignmentStore.removeRiskyAssignment(assignmentId)
        if (result)
            this.setState({isShowRiskyModal: false})
    }

    handleChangePickupAddressType = (e) => {
        this.setState({pickupAddressType: e.target.value});
    }

    handleChangeInput = (e) => {
        if(!e || !e.target) return;
        const {name, value} = e.target;
        this.setState({[name]: value});
        const {latitude, longitude, geocodeErrorMsg} = this.state
        if(latitude || longitude || geocodeErrorMsg) {
            this.setState({
                latitude: '-',
                longitude: '-',
                geocodeErrorMsg: '',
            })
        }
    }

    geocodeAddress = () => {
        const { geocodeAddressListStore} = this.props;

        this.setState({geocodeErrorMsg: '', geocoding: true});
        const {street, city, state, zipcode} = this.state;
        const address = {
            street,
            city,
            state,
            zipcode
        }

        if(!street || !city || !state || !zipcode) {
            this.setState({
                geocoding: false,
                geocodeErrorMsg: 'Please fill in all required fields.',
            })
            return;
        }
        geocodeAddressListStore.geocode(address, res => {
          if (res.ok && res.data) {
            this.setState({
                latitude: res.data.latitude,
                longitude: res.data.longitude,
            })
          } else {
            this.setState({
                latitude: '-',
                longitude: '-',
            })
            toast.error(res.data && res.data.message ? res.data.message : 'Geocode Error', {containerId: 'main'});
          }
          this.setState({geocoding: false})
        })
    }

    handleChangeRefreshPricing = (e) => {
        if(!e || !e.target) return;
        const {checked} = e.target;

        this.setState({
            isRefreshPricing: checked
        })
    }

    refreshAssignmentNotes = () => {
      this.setState({ refreshNoteTs: Date.now() });
    };
    addReturnStop = async(assignmentId) => {
        const {assignmentStore} = this.props;
        this.setState({
            updatingPickup:true
        })
        const result = await assignmentStore.addReturnStop(assignmentId)
        if (result.status === 200){
            toast.success('Add return stop successfully', {containerId: 'main'});
            setTimeout(function(){ assignmentStore.loadAssignment(assignmentId) }, 1000);
        }else{
            toast.error(result.data.message, {containerId: 'main'});
        }
        this.setState({
            messageAddReturnStop: false,
            updatingPickup:false
        })
    }
    
    render() {
        const {
            selectedTab, showMoveAssignmentBox, moveHour, moveAssignmentReason, moveAssignmentSMS, notifyBySMS,
            markRolled, notifyByEmail, warehouseInfo, pickupAddressType, street, city, state, zipcode,
            latitude, longitude, geocoding, geocodeErrorMsg, isRefreshPricing, updateWarehouseId, refreshNoteTs,
            delayReason, isMoveToNextDay, isOpenDeactiveOrActive, isSaving
        } = this.state;
        const { assignmentInfo, assignmentStore, userStore, viewOnly, onRemoveAssignmentFromSession, clientStore, permissionStore } = this.props;
        const { activeClients } = clientStore;
        const onDemandClientIds = activeClients.ondemand;

        if (!assignmentInfo) return <div />;

        const { completable, isCompleted, isPickedUp, shipments } = assignmentInfo
        const {addingShipment, filteredShowingStops, loadingAssignment } = assignmentStore;
        const { isAdmin, user } = userStore

        let assignmentLabel = assignmentInfo && assignmentInfo.assignment ? assignmentInfo.assignment.label : null;
        let assignment = assignmentInfo ? assignmentInfo.assignment : null;
        let driverBonus = assignmentInfo ? assignmentInfo.bonus : null;
        let driver = assignmentInfo ? assignmentInfo.driver : null;
        const {externalInfo, courier} = assignmentInfo || {};
        // const isCompleted = assignment && assignment.status === 'COMPLETED'
        const isInprogress = assignment && assignment.status === 'IN_PROGRESS';
        const isActivated = assignment && assignment.driver_id && assignment.is_active;
        const isPending = assignment && assignment.driver_id && !assignment.is_active;
        const isReserved = assignment && assignment.status === 'RESERVED';
        const statusColor = assignment.status ? STATUS_COLOR_CODE[assignment.status] : STATUS_COLOR_CODE['PENDING'];
        const isUnassigned = assignment && !assignment.driver_id && assignment.status !== 'COMPLETED';
        // const isAssignmentCompletedWithTopic = isCompleted && !!(assignmentSummeries[assignment.id] && assignmentSummeries[assignment.id].topic_id);
        const isAvailableMessageButton = !isUnassigned;
        const riskIds = [...assignmentStore.riskObj["inactiveIds"], ...assignmentStore.riskObj["returnIds"], ...assignmentStore.riskObj["lateIds"]]
        const isOnDemand = assignment.client_ids != null ? assignment.client_ids.filter(cid => onDemandClientIds.includes(cid)).length > 0 : false;

        let shipmentIds = [];
        if (assignmentInfo && assignmentInfo.stops) {
            shipmentIds = assignmentInfo.stops.filter(s => s.shipment_id).map(s => s.shipment_id);
            shipmentIds = _.sortBy(_.uniq(shipmentIds));
        }

        let modalHeight = '200px';
        if (this.state.requestDeleteAssignment || this.state.requestRestoreDeletedAssignment) {
            modalHeight = '370px';
        }
        const tz = moment.tz.guess();

        const isDeniedBonus = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.BONUS_ROUTE);
        
        return <AxlPanel style={{ ...styles.container, ...this.style }}>
            <Dialog open={this.state.showUpdatePickupBox} maxWidth='md' fullWidth={true} onClose={this.closeUpdatePickupBox} aria-labelledby="form-dialog-title">
                <DialogTitle id="change-assignment-pickup">Change Assignment Pickup</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            assignmentInfo && assignmentInfo.assignment && assignmentInfo.assignment.warehouse_id && (
                                <Fragment>
                                    <span>Current Warehouse: </span>
                                    <AxlPanel.Row>
                                        <AxlPanel.Col>
                                            <AxlPanel.Row>
                                                <AxlPanel.Col><span style={styles.label}>{`ID:`}</span><span style={styles.text}>{ warehouseInfo ? warehouseInfo.id : 'N/A' }</span></AxlPanel.Col>
                                                <AxlPanel.Col><span style={styles.label}>{`ALIAS:`}</span><span style={styles.text}>{ warehouseInfo ? warehouseInfo.alias : 'N/A' }</span></AxlPanel.Col>
                                            </AxlPanel.Row>
                                            <AxlPanel.Row>
                                                <AxlPanel.Col><span style={styles.label}>{`ADDRESS:`}</span><span style={{...styles.text,'paddingLeft': '5px'}}>{ warehouseInfo && warehouseInfo.address ? `${warehouseInfo.address.street}, ${warehouseInfo.address.street2 && warehouseInfo.address.street2 != '' ? ` ` + warehouseInfo.address.street2 + `, ` : ''}${warehouseInfo.address.city}, ${warehouseInfo.address.state}, ${warehouseInfo.address.zipcode}` : 'N/A'}</span></AxlPanel.Col>
                                            </AxlPanel.Row>
                                        </AxlPanel.Col>
                                    </AxlPanel.Row>
                                </Fragment>
                            )
                        }

                        {
                            (!assignmentInfo || !assignmentInfo.assignment || !assignmentInfo.assignment.warehouse_id) && (shipments && shipments.length > 0) && (
                                <Fragment>
                                    <span>Current Custom Address: </span>
                                    <AxlPanel.Row>
                                        <AxlPanel.Col>
                                            <AxlPanel.Row>
                                                <AxlPanel.Col><span style={styles.label}>{`ADDRESS:`}</span><span style={styles.text}>{ shipments[0].pickup_address && shipments[0].pickup_address.street || 'N/A' }</span></AxlPanel.Col>
                                            </AxlPanel.Row>
                                            <AxlPanel.Row>
                                                <AxlPanel.Col><span style={styles.label}>{`CITY:`}</span><span style={styles.text}>{ shipments[0].pickup_address && shipments[0].pickup_address.city || 'N/A' }</span></AxlPanel.Col>
                                                <AxlPanel.Col><span style={styles.label}>{`STATE:`}</span><span style={styles.text}>{ shipments[0].pickup_address && shipments[0].pickup_address.state || 'N/A' }</span></AxlPanel.Col>
                                                <AxlPanel.Col><span style={styles.label}>{`ZIPCODE:`}</span><span style={styles.text}>{ shipments[0].pickup_address && shipments[0].pickup_address.zipcode || 'N/A' }</span></AxlPanel.Col>
                                            </AxlPanel.Row>
                                        </AxlPanel.Col>
                                    </AxlPanel.Row>
                                </Fragment>
                            )
                        }
                    </DialogContentText>
                    <DialogContentText>
                        <RadioGroup value={pickupAddressType} onChange={this.handleChangePickupAddressType} style={{flexDirection: 'row'}}>
                            <FormControlLabel value="warehouse" control={<Radio color='primary'/>} label="Warehouse" />
                            <FormControlLabel value="customAddress" control={<Radio color='primary'/>} label="Custom Address" />
                        </RadioGroup>
                    </DialogContentText>
                    {pickupAddressType === 'warehouse' && (
                        <DialogContentText>
                            {this.state.warehouses && <Autocomplete
                                id="update-warehouse"
                                options={this.state.warehouses.sort((a, b) => {
                                    if (!a.region || a.region.trim() === '') return 1;
                                    if (!b.region || b.region.trim() === '') return -1;

                                    if (assignment && a.region && a.region === assignment.region_code) return -1;
                                    if (assignment && b.region && b.region === assignment.region_code) return 1;

                                    const regionA = a.region && a.region.trim() !== '' ? a.region : '';
                                    const regionB = b.region && b.region.trim() !== '' ? b.region : '';
                                    return regionA.localeCompare(regionB);
                                })}
                                groupBy={(option) => option.region && option.region.trim() !== '' ? option.region : 'No Region'}
                                getOptionLabel={(wh) => {
                                    const value = `[${wh.id}] ${wh.alias ? wh.alias + ' @ ' : ''}${wh.address.street}, ${wh.address.street2 && wh.address.street2 != '' ? ` ` + wh.address.street2 + `, ` : ''}${wh.address.city}, ${wh.address.state}, ${wh.address.zipcode}`;
                                    return value;
                                }}
                                onChange={this.changeWarehouse}
                                fullWidth
                                value={this.state.warehouses.find(w => w.id == updateWarehouseId)}
                                renderInput={(params) => <TextField {...params} label="Select warehouse to update" variant="outlined" />}
                            />}
                        </DialogContentText>
                    )}

                    {pickupAddressType === 'customAddress' && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField required label="Address Line 1 (house or building number and street name)" variant="outlined" value={street} fullWidth name='street' onChange={this.handleChangeInput} />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField required label="City" variant="outlined" value={city} fullWidth name='city' onChange={this.handleChangeInput}/>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField required label="State" variant="outlined" value={state} fullWidth name='state' onChange={this.handleChangeInput}/>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField required label="Zipcode" variant="outlined" value={zipcode} fullWidth name='zipcode' onChange={this.handleChangeInput}/>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField label="Latitude" variant="outlined" value={latitude} disabled fullWidth size='small' />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField label="Longitude" variant="outlined" value={longitude} disabled fullWidth size='small' />
                            </Grid>
                            <Grid item xs={2} style={{alignSelf: 'center', padding: '0px 8px'}}>
                                <Button variant="contained" size='small' fullWidth style={{padding: '6.5px 22px'}} disableElevation={true} disabled={geocoding} onClick={this.geocodeAddress}>
                                    {geocoding ? <CircularProgress color="primary" size={26} style={{marginRight: 5}} /> : "Geocode"}
                                </Button>
                            </Grid>
                            <Grid item xs={12} style={{justifyContent: 'flex-end', display: 'flex'}}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isRefreshPricing}
                                            onChange={this.handleChangeRefreshPricing}
                                            name="refreshPricing"
                                            color="primary"
                                        />
                                    }
                                    label="Refresh Pricing"
                                    labelPlacement='start'
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions style={{padding: '8px 24px', justifyContent: 'space-between'}}>
                    <Box>
                        {geocodeErrorMsg && (
                            <Typography variant='subtitle2' color='error'>{geocodeErrorMsg}</Typography>
                        )}
                    </Box>
                    <Box style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
                        <Button onClick={this.closeUpdatePickupBox} color="primary">
                            Close
                        </Button>
                        <div>
                            <Button disabled={!!this.state.updatingPickup || (pickupAddressType === 'warehouse' && !updateWarehouseId) || (pickupAddressType === 'customAddress' && latitude === "-" && longitude === "-")} onClick={this.updateAssignmentPickup} variant="contained" color="primary">
                                Change Pickup
                            </Button>
                            {this.state.updatingPickup && <CircularProgress size={24} style={{color: 'green', position: 'absolute', top: '10%', left: '40%'}} />}
                        </div>
                    </Box>
                </DialogActions>
            </Dialog>

            <SimpleModal open={showMoveAssignmentBox} onClose={this.closeMoveAssignmentBox} maxWidth="lg" minWidth={900} centerTitle
                         title={`Do you want to move Assignment ${assignmentLabel || ''} to ${moveHour > 0 ? 'next' :  'previous'} day?`}
            >
                <DialogContent>
                    {isOnDemand && (
                      <Box align="left" pl={1}>
                          <Box my={1}>
                              <Grid container>
                                  <Grid item sm={4}>
                                      <Box component="span">Current Dropoff Window:</Box>
                                  </Grid>
                                  <Grid item sm={8}>
                                      <Box component="strong" style={{color: '#000'}}>
                                          <span>{moment.tz(assignment.predicted_start_ts, tz).format("MM/DD/YYYY")} </span>
                                          <span>{moment.tz(assignment.predicted_start_ts, tz).format("HH:mm")} - </span>
                                          <span>{moment.tz(assignment.predicted_end_ts, tz).format("HH:mm")} </span>
                                          <span>{moment.tz(assignment.predicted_start_ts, tz).format("z")}</span>
                                      </Box>
                                  </Grid>
                              </Grid>
                          </Box>
                          <Box my={1}>
                              <Grid container alignItems="flex-start">
                                  <Grid item sm={4}>
                                      <Box>New Dropoff Window:</Box>
                                  </Grid>
                                  <Grid item sm={8}>
                                      <Grid container alignItems="center" spacing={1}>
                                          <Grid item>
                                              <AxlDateInput
                                                theme={'secondary'}
                                                onChange={(d) => this.changeMoveAssignmentHour(d, assignment.predicted_start_ts)}
                                                options={{
                                                    defaultValue: moment(assignment.predicted_start_ts).add(moveHour, 'hours').toDate(),
                                                    defaultDate: moment(assignment.predicted_start_ts).add(moveHour, 'hours').toDate(),
                                                    dateFormat: 'MM/DD/YYYY HH:mm',
                                                    placeHolder: 'today',
                                                    enableTime: true,
                                                    altInput: true,
                                                    clickOpens: false,
                                                    time_24hr: true,
                                                }}
                                              />
                                          </Grid>
                                          <Grid item>
                                              <span>- {moment.tz(assignment.predicted_end_ts, tz).add(moveHour, 'hours').format("HH:mm z")}</span>
                                          </Grid>
                                      </Grid>
                                      <Box component="small" style={{fontSize: 10}}>Can change date and hour only</Box>
                                  </Grid>
                              </Grid>
                          </Box>
                      </Box>
                    )}
                    <Box p={1}>
                      <div style={styles.title}>Reason</div>
                      {isMoveToNextDay && (
                        <Box marginBottom={1}>
                          <FormControl fullWidth size="small">
                            <Select value={delayReason} onChange={this.handleChangeDelayReason} variant="outlined" fullWidth>
                              {DELAY_REASON.map((item) => (
                                <MenuItem key={item.key} value={item.key} reason={item.label}>
                                    {item.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      )}
                      {(!isMoveToNextDay || (isMoveToNextDay && delayReason === 'OTHER')) && (
                        <AxlTextArea
                          style={{ width: '100%', height: '140px' }}
                          value={moveAssignmentReason}
                          onChange={this.changeMoveAssignmentReason}
                          placeholder="Please input reason before submitting"
                        />
                      )}
                    </Box>
                    <Box px={1}>
                        <Box style={styles.title}>
                            <Checkbox checked={markRolled} onChange={(event) => this.setState({ markRolled: event.target.checked })} style={{ paddingLeft: 0 }} />
                            Mark as rolled
                        </Box>
                    </Box>
                    <Box px={1}>
                        <Box align="left">
                            <Box display="inline-flex" alignItems="center">
                                <Checkbox checked={notifyBySMS} onChange={(event) => this.setState({ notifyBySMS: event.target.checked })} style={{ paddingLeft: 0 }} />
                                <span style={styles.title}>Send SMS notification to customers?</span>
                            </Box>
                            {isMoveToNextDay && (
                              <Box display="inline-flex" alignItems="center">
                                  <Checkbox checked={notifyByEmail} onChange={(event) => this.setState({ notifyByEmail: event.target.checked })} />
                                  <span style={styles.title}>Send to client success to review</span>
                              </Box>
                            )}
                            {notifyBySMS && (
                              <Box>
                                  <AxlTextArea style={{width: '100%', height: '100px'}} value={moveAssignmentSMS} onChange={ this.changeMoveAssignmentSMS } />
                              </Box>
                            )}
                        </Box>
                    </Box>
                    <div style={{textAlign: 'center'}}>
                        <AxlButton onClick={this.moveAssignmentDate} loading={assignmentStore.movingAssignment} disabled={!moveAssignmentReason || (moveAssignmentReason.trim() === '') || assignmentStore.movingAssignment} bg={'red'} style={{width: '160px'}}>Move</AxlButton>
                        <AxlButton onClick={this.closeMoveAssignmentBox} bg='none' style={{width: '160px'}}>Cancel</AxlButton>
                    </div>
                </DialogContent>
            </SimpleModal>

            {this.state.showExtraAssignmentInfo && <AxlModal onClose={this.closeAssignmentExtraInfo} style={{width: '1000px', height: modalHeight, textAlign: 'center', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
                <h4>
                    Assignment <strong>{assignmentLabel || ''}</strong>
                    {assignmentInfo.assignment && assignmentInfo.assignment.deleted && <span style={{color: 'red', fontSize: '12px', paddingLeft: '5px'}}>[<span>DELETED</span>]</span>}
                </h4>
                <div style={{position: 'absolute', top: '50px', left: '8px', right: '8px', bottom: '80px', overflow: 'auto', padding: '10px'}}>
                <div style={{textAlign: 'left'}}>
                    <div style={styles.title}>Shipment IDs</div>
                    <div style={styles.codebox}>
                        <code>
                            {shipmentIds.join(", ")}
                        </code>
                        <CopyToClipboard text={shipmentIds.join(", ")}
                            onCopy={() => this.setState({copied: true})}>
                            <AxlButton style={styles.copybtn} bg={`gray`} compact={true} ico={{className: 'fa fa-clipboard'}} />
                        </CopyToClipboard>
                    </div>
                    <div style={{textAlign: 'right'}}>{this.state.copied ? <span style={{color: 'red', fontSize: '10px'}}>Copied.</span> : null}</div>

                    {!(assignmentInfo.assignment && assignmentInfo.assignment.deleted) && <div>
                        <div>
                            <AxlCheckbox checked={!!this.state.requestDeleteAssignment} onChange={this.requestDeleteAssignment} />
                            <span style={styles.title}> delete this assignment?</span>
                        </div>
                        {this.state.requestDeleteAssignment && <div>
                            <AxlTextArea style={{width: '100%', height: '140px'}} value={this.state.deleteAssignmentReason} onChange={ this.changeDeleteAssignmentReason } />
                            <span style={{fontSize: '11px'}}><strong>Please input reason before submit</strong></span>
                        </div>}
                    </div>}
                    {false && (assignmentInfo.assignment && assignmentInfo.assignment.deleted) && <div>
                        <div>
                            <AxlCheckbox checked={!!this.state.requestRestoreDeletedAssignment} onChange={this.requestRestoreDeletedAssignment} />
                            <span style={styles.title}> Restore this assignment?</span>
                        </div>
                        {this.state.requestRestoreDeletedAssignment && <div>
                            <AxlTextArea style={{width: '100%', height: '140px'}} value={this.state.restoreDeletedAssignmentReason} onChange={ this.changeRestoreDeletedAssignmentReason } />
                            <span style={{fontSize: '11px'}}><strong>Please input reason before submit</strong></span>
                        </div>}
                    </div>}
                    {(this.state.deleteAssignmentError && this.state.deleteAssignmentError.trim() !== '') &&
                        <div style={{color: 'red', fontSize: '12px', textAlign: 'center', fontWeight: 'bold'}}>{this.state.deleteAssignmentError}!</div>}
                </div>
                </div>
                {this.state.requestDeleteAssignment && <div style={{textAlign: 'center', position: 'absolute', bottom: '20px', left: 0, right: 0, paddingTop: '12px', height: '60px'}}>
                  <AxlButton loading={assignmentStore.deletingAssignment} disabled={!this.state.deleteAssignmentReason || (this.state.deleteAssignmentReason.trim() == '')} bg={'red'} style={{width: '160px'}} onClick={this.deleteAssignment}>Delete Assignment</AxlButton>
                  <AxlButton style={{width: '160px'}} onClick={this.closeAssignmentExtraInfo}>Close</AxlButton>
                </div>}

                {false && this.state.requestRestoreDeletedAssignment && <div style={{textAlign: 'center', position: 'absolute', bottom: '20px', left: 0, right: 0, paddingTop: '12px', height: '60px'}}>
                  <AxlButton loading={assignmentStore.restoringAssignment} disabled={!this.state.restoreDeletedAssignmentReason || (this.state.restoreDeletedAssignmentReason.trim() == '')} bg={'red'} style={{width: '160px'}} onClick={this.restoreDeletedAssignment}>Restore Assignment</AxlButton>
                  <AxlButton style={{width: '160px'}} onClick={this.closeAssignmentExtraInfo}>Close</AxlButton>
                </div>}
            </AxlModal>}

            <AxlPanel.Row style={styles.header}>
                {assignment.status !== 'COMPLETED' && <ButtonGroup color="inherit" size="small">
                    <Tooltip title="Move this assignment to the previous day">
                        <IconButton onClick={this.displayMoveAssignmentBox(-24)}>
                            <NavigateBeforeIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Move this assignment to the next day">
                        <IconButton onClick={this.displayMoveAssignmentBox(24)}>
                            <NavigateNextIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Update warehouse">
                        <IconButton onClick={this.displayUpdatePickupBox}>
                            <HomeIcon />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>}

                <AxlPanel.Col>
                    <div style={styles.title}>
                        {`Assignment ${assignment ? assignment.label : ''} Details`} {assignment && <code style={styles.highlightCode}>{assignment.id}</code>}
                    </div>
                </AxlPanel.Col>
                <AxlPanel.Col flex={0}>
                    {assignment && <div style={styles.statusBox}>
                        Status: <span style={{...styles.status, color: statusColor}}>{assignment.status}</span>
                    </div>}
                </AxlPanel.Col>
            </AxlPanel.Row>
            <AxlPanel.Row style={styles.generalInfoTitle} align={`flex-start`}>
                <AxlPanel.Col style={{flex: 2}}>
                    <div style={{...styles.timewindow, ...styles.box}}>
                        <div style={styles.label}>{`EST. TIME WINDOW`}</div>
                        {assignment && <TimeWindowWithZone
                          timezone={_.get(assignment, 'timezone')}
                          startTs={_.get(assignment, 'predicted_start_ts')}
                          endTs={_.get(assignment, 'predicted_end_ts')} />}
                    </div>
                </AxlPanel.Col>
                <AxlPanel.Col>
                    <div style={styles.box}>
                        <div style={styles.label}>{`EST. DISTANCE`}</div>
                        <div style={styles.text}>{convertMeterToMile(assignment.travel_distance)} {`mi`}</div>
                    </div>
                </AxlPanel.Col>
                {!isPickedUp && <AxlPanel.Col>
                    <div style={styles.box}>
                        <div style={styles.label}>{`ETA`}</div>
                        <div>
                            <Eta onUpdate={(e) => this.onEtaUpdated(assignment.id, e)} assignmentId={assignment.id} tz={assignment.timezone} />
                        </div>
                    </div>
                </AxlPanel.Col> }
                { completable && <AxlPanel.Col flex={0}>
                    <div style={{...styles.box}}>
                      <AssignmentComplete assignmentID={assignment.id} onOk={this.onComplete} />
                    </div>
                </AxlPanel.Col> }
            </AxlPanel.Row>
            <AssignmentSMS assignmentId={assignmentInfo.assignment.id} stops={filteredShowingStops} />
            <AssignmentNote assignmentId={assignmentInfo.assignment.id} userId={user.id} refreshNoteTs={refreshNoteTs} />
            <AssignmentNotd assignmentId={assignmentInfo.assignment.id} userId={user.id}/>
            <DriverInfoCard
                history={this.props.history}
                driver={driver}
                courier={courier}
                assignmentId={assignmentInfo.assignment.id}
                assignment={assignmentInfo.assignment}
                labels={assignmentInfo.shipmentLabels}
                driverScore={assignmentInfo.driverScore}
                isActivated={isActivated}
                isCompleted={isCompleted}
                isReserved={isReserved}
                onUnAssignDriver={this.onUnAssignDriver}
                onUnAssignDsp={this.onUnAssignDsp}
                showDriverSearch={this.showDriverSearch} />
            {isCompleted && !viewOnly &&
                <AxlPanel.Row align={`center`} style={styles.completeButtons}>
                    <AxlButton bg={'periwinkle'} compact={true} onClick={this.showFeedBackModal}>{`Feedback`}</AxlButton>
                    <E.GroupControl>
                        { !!assignment.tour_cost && <AxlButton bg={`white`} compact={true} style={{...styles.groupControl, ...styles.groupControlFirst}}>${parseFloat(assignment.tour_cost).toFixed(1)}</AxlButton> }
                        { !!assignment.tour_cost && (
                          <TooltipContainer title={isDeniedBonus ? PERMISSION_DENIED_TEXT : ''}>
                            <AxlButton disabled={isDeniedBonus} bg={`gray`} compact={true} style={{...styles.groupControl}} onClick={this.showAssignmentbonus}>{`${assignment.bonus && assignment.bonus !== 0 ? '+$' + assignment.bonus : 'Bonus'}`}</AxlButton>
                          </TooltipContainer>
                        )}
                        { !!driverBonus && <AxlButton bg={`gray`} compact={true} style={{...styles.groupControl, ...styles.groupControlLast}}>{`${driverBonus.bonus && driverBonus.bonus !== 0 ? '+$' + driverBonus.bonus : '-'}`}</AxlButton> }
                    </E.GroupControl>
                    <AxlPanel.Col style={styles.textRight}>
                        {isAvailableMessageButton && this.props.onShowMessenger && <AxlButton bg={`gray`} compact={true} source={`/assets/images/svg/message.svg`} onClick={this.props.onShowMessenger} style={{lineHeight: 0}}/>}
                        {this.props.onShowAddingShipment && <AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-plus-circle'}} onClick={this.props.onShowAddingShipment} style={{lineHeight: 0}}/>}
                    </AxlPanel.Col>
                </AxlPanel.Row>
            }
            {!isCompleted && !viewOnly &&
                <AxlPanel.Row align={`center`} style={styles.isCompleteButtons}>
                    <E.GroupButtons>
                        <Button 
                          disabled={!isActivated && !assignment.driver_id} 
                          variant='contained' 
                          color='primary' 
                          size='small' 
                          style={{...styles.button}}
                          onClick={() => this.setState({isOpenDeactiveOrActive: true})}
                          startIcon={!isActivated && <Icon className='fa fa-rocket' style={{fontSize: 14}}/>}
                        >{!isActivated ? 'Activate' : 'De-Activate'}</Button>
                        {isUnassigned && <AxlButton bg={'gray'} compact={true} onClick={this.showMessagePool}>{`Message Pool`}</AxlButton>}

                        <E.GroupControlLeft>
                            { !!assignment.tour_cost && <AxlButton bg={`white`} compact={true} style={{...styles.groupControl, ...styles.groupControlFirst}}>${parseFloat(assignment.tour_cost).toFixed(1)}</AxlButton> }
                            { !!assignment.tour_cost && (
                              <TooltipContainer title={isDeniedBonus ? PERMISSION_DENIED_TEXT : ''}>
                                <AxlButton disabled={isDeniedBonus} bg={`gray`} compact={true} style={{...styles.groupControl}} onClick={this.showAssignmentbonus}>{`${assignment.bonus && assignment.bonus !== 0 ? '+$' + assignment.bonus : 'Bonus'}`}</AxlButton>
                              </TooltipContainer>
                            )}
                            { !!driverBonus && <AxlButton bg={`gray`} compact={true} style={{...styles.groupControl, ...styles.groupControlLast}}>{`${driverBonus.bonus && driverBonus.bonus !== 0 ? '+$' + driverBonus.bonus : '-'}`}</AxlButton> }
                        </E.GroupControlLeft>
                        <E.GroupControl>
                            { !!assignment.tour_cost &&
                                <Tooltip title="Add return stop">
                                    <span>
                                        <AxlButton bg={'gray'} compact={true} onClick={this.showMessageAddReturnStop}>
                                            <div style={{...styles.returnStopAdd}}>
                                                <AssignmentReturn fontSize={'small'} />
                                            </div>
                                        </AxlButton>
                                    </span>
                                </Tooltip>
                            }
                        </E.GroupControl>
                        <E.GroupControl>
                            {onRemoveAssignmentFromSession && (
                              <div>
                                  <Tooltip title="Remove assignment from ticket">
                                      <span><AxlButton bg={`red`} compact={true} ico={{className: 'fa fa-trash'}} onClick={() => this.setState({isShowRemoveModal: true})} /></span>
                                  </Tooltip>
                              </div>
                            )}
                            <Geofencing targetPrefix='AS' targetID={assignment.id} targetNoteID={assignment.id} onSuccess={this.refreshAssignmentNotes} />
                            {<ReorderShipment assignmentStore={assignmentStore}/>}
                            {riskIds.includes(assignment.id) && (
                                <Tooltip title="Remove assignment from risky">
                                    <span><AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-exclamation-triangle'}} onClick={() => this.setState({isShowRiskyModal: true})} style={{lineHeight: 0}}/></span>
                                </Tooltip>
                            )}
                            {isAvailableMessageButton && <AxlButton bg={`gray`} compact={true} source={`/assets/images/svg/message.svg`} onClick={this.props.onShowMessenger} style={{lineHeight: 0}}/>}
                            <AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-plus-circle'}} onClick={this.props.onShowAddingShipment} />
                            {(userStore.isAdmin || userStore.isSuperAdmin) &&
                                <AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-info'}} onClick={this.displayAssignmentExtraInfo} />
                            }
                        </E.GroupControl>
                    </E.GroupButtons>
                </AxlPanel.Row>
            }
            { this.state.showDriverSearch && <AxlModal style={styles.axlModal} onClose={this.hideDriverSearch}>
                <AxlPanel.Row style={styles.modalHeader}>
                    <AxlPanel.Col>
                        <div style={selectedTab === 'driver' ? {...styles.modalHeaderTab, ...styles.modalHeaderTabSelected} : {...styles.modalHeaderTab}}
                             onClick={() => this.setState({selectedTab: 'driver'})}
                        >
                            AH Drivers
                        </div>
                    </AxlPanel.Col>
                    <AxlPanel.Col>
                        <div style={selectedTab === 'dsp' ? {...styles.modalHeaderTab, ...styles.modalHeaderTabSelected} : {...styles.modalHeaderTab}}
                             onClick={() => this.setState({selectedTab: 'dsp'})}
                        >
                            DSP
                        </div>
                    </AxlPanel.Col>
                </AxlPanel.Row>
                <div style={styles.modalBody}>
                    <div style={{display: selectedTab === 'driver' ? 'block' : 'none'}}>
                        <DriverSearch
                          type={DRIVER_SEARCH_ASSIGNMENT}
                          assignment={assignment}
                          onSelect={this.onAssignDriver}
                          onCancel={this.hideDriverSearch}
                          okText={assignment && assignment.driver_id ? REASSIGN_BTN_TEXT : ASSIGN_BTN_TEXT}
                          driverIdSelected={assignment.driver_id}
                        />
                    </div>
                    <div style={{display: selectedTab === 'dsp' ? 'block' : 'none', height: '100%'}}>
                        <DspSearch
                          assignment={assignment}
                          onSelect={this.onAssignDsp}
                          onCancel={this.hideDriverSearch}
                          dspIdSelected={assignment.courier_id}
                        />
                    </div>
                </div>
            </AxlModal> }
            { this.state.showAssignmentBonus && <AxlModal style={styles.axlAssignmentBonusModal} onClose={this.hideAssignmentbonus}>
                <AssignmentBonus assignment={assignment} closeMe={this.hideAssignmentbonus} />
            </AxlModal> }
            { this.state.showMessagePoolModal && <AxlModal style={styles.axlAssignmentBonusModal} onClose={this.hideMessagePool}>
                <AssignmentMessagePool assignment={assignment} onClose={this.hideMessagePool} />
            </AxlModal> }
            { this.state.isShowFeedBackModal && <AxlModal style={styles.feedbackModal} onClose={this.hideFeedBackModal}>
                <AssignmentFeedback assignmentId={assignment.id} driverId={assignment.driver_id} closePopup={this.hideFeedBackModal} />
            </AxlModal> }
            
            <SimpleModal open={this.state.messageAddReturnStop} onClose={this.hideMessageAddReturnStop} maxWidth="lg" minWidth={900} centerTitle
            title='Do you want to add return stop?'>
                <DialogContent >
                {this.state.updatingPickup?
                    <div style={styles.spinReturnStop}>
                        <CircularProgress size={24} style={{color: 'green', position: 'absolute', top: '50%', left: '50%'}} />
                    </div>:
                    <div style={styles.returnStopButtonList}>
                        <Button  style={styles.okButton} onClick={()=>this.addReturnStop(assignment.id)}>Add</Button>
                        <Button  style={styles.cancelButton} onClick={this.hideMessageAddReturnStop}>Cancel</Button>
                    </div>
                }
                </DialogContent>
            </SimpleModal>
            { this.state.isShowRemoveModal && <AxlModal style={styles.box} onClose={this.hideRemoveModal}>
                <AxlPanel>
                    <AxlPanel.Row align="center">
                        <div style={styles.box}>Are you sure to remove this assignment from booking session?</div>
                    </AxlPanel.Row>
                    <AxlPanel.Row align="center">
                        <AxlButton compact bg="white" onClick={this.hideRemoveModal}>Cancel</AxlButton>
                        <AxlButton compact bg="red" onClick={onRemoveAssignmentFromSession}>Remove</AxlButton>
                    </AxlPanel.Row>
                </AxlPanel>
            </AxlModal> }
            { this.state.isShowRiskyModal && <AxlModal style={styles.box} onClose={this.hideRiskyModal}>
                <AxlPanel>
                    <AxlPanel.Row align="center">
                        <div style={styles.box}>Are you sure to mark this assignment isn't risky ?</div>
                    </AxlPanel.Row>
                    <AxlPanel.Row align="center">
                        <AxlButton compact bg="white" onClick={this.hideRiskyModal}>Cancel</AxlButton>
                        <AxlButton compact bg="red" onClick={() => this.onRemoveRiskyAssignment(assignment.id)} style={{width: '50px'}}> Yes </AxlButton>
                    </AxlPanel.Row>
                </AxlPanel>
            </AxlModal> }
            { loadingAssignment && <E.LoadingContainer><AxlLoading color="#FFF" size={75} thin={1} /></E.LoadingContainer> }
            {this.state.SMSCost && <DialogSMSCost SMSCost={this.state.SMSCost} callbackSmsAction={() => this.moveAssignmentDate()} clearSMSCost={() => this.clearSMSCost()}></DialogSMSCost>}

            {isOpenDeactiveOrActive && <AxlDialog
              isOpen={isOpenDeactiveOrActive}
              handleClose={isSaving ? () => null : () => this.setState({ isOpenDeactiveOrActive: false})}
              childrenTitle={!isActivated ? 'Active' : 'Deactive'}
              children={`Please confirm you want to ${!isActivated ? 'active' : 'deactive'} assignment?`}
              maxWidth='xs'
              childrenAction={
                <Box>
                  <Button disabled={isSaving} onClick={() => this.setState({ isOpenDeactiveOrActive: false})} style={{marginRight: 8}} size='small'>Cancel</Button>
                  <Button disabled={isSaving} variant='contained' color='primary' onClick={!isActivated ? this.onActivate : this.onDeActivate} size='small'>
                    {isSaving && <CircularProgress size={20} style={{marginRight: 8}}/>} Save
                  </Button>
                </Box>
              }
              DialogContentProps={{
                style: {
                  padding: '24px 16px'
                }
              }}
            />}

        </AxlPanel>
    }
}

export default AssignmentDetail;
