import React, { Component } from 'react';
import { Styles } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import { withRouter, Route } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { compose } from 'recompose';
import { Box, Grid, ThemeProvider, IconButton } from "@material-ui/core";
import PinDropIcon from '@material-ui/icons/PinDrop';

// Components
import AssignmentDetail from '../../containers/AssignmentDetail/index';
import ShipmentList from '../../containers/ShipmentList/index';
import ShipmentDetail from '../../containers/ShipmentDetail/index';
import AssignmentMap from '../../components/AssignmentMap/index';
import { EventAssignmentList } from "../../components/EventAssignmentList";
import AddingShipmentDetail from "../../components/AddingShipmentDetail";
import ShipmentMessenger from "../../containers/ShipmentMessenger";
import AssignmentBreakdown from '../../components/AssignmentBreakdown/index';
import Toast from "../../components/Toast";
import LocationPin from '../Dispatch/locationPin';
import AxlDialog from '../../components/AxlDialog';

// Styles
import styles, * as E from './styles';
import  { withFirebase } from "../../components/Firebase";
import MessengerToast from "../MessengerToast";
import { lightTheme } from "../../themes";


@inject('assignmentStore')
@observer
class AssignmentDetailContainer extends Component {

    render() {
        const { assignmentStore } = this.props
        const { selectedAssignment } = assignmentStore;

        return <AssignmentDetail assignmentInfo={selectedAssignment} onShowAddingShipment={this.props.onShowAddingShipment} onShowMessenger={this.props.onShowMessenger} history={this.props.history} />
    }
}

@inject('assignmentStore', 'shipmentStore')
@observer
class AssignmentMapContainer extends Component {
    render() {
        const { assignmentStore, shipmentStore } = this.props
        const { selectedStop, previewShipment } = shipmentStore
        const { selectedAssignment } = assignmentStore;

        return selectedAssignment ? <AssignmentMap previewShipment={previewShipment} assignment={selectedAssignment} locations={selectedAssignment ? selectedAssignment.locations : null} driverLocation={selectedAssignment ? selectedAssignment.driverLocation : null} shipment={selectedStop ? selectedStop.shipment : null} /> : null
    }
}

@inject('assignmentStore', 'shipmentStore')
@observer
class ShipmentDetailContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            engagedTime: null,
            isOpenLocationPin: false,
        }
    }

    componentDidMount() {
        const { assignmentStore } = this.props;
        const { selectedAssignmentId } = assignmentStore;
        if (selectedAssignmentId) {
            this._getEngagementTime(selectedAssignmentId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { assignmentStore } = this.props;
        const { selectedAssignmentId } = assignmentStore;
        if (!_.isEqual(prevProps.match.params, this.props.match.params)) {
            this._getEngagementTime(selectedAssignmentId);
        }
    }

    _getEngagementTime = (selectedAssignmentId) => {
        const { assignmentStore } = this.props;

        assignmentStore.getEngageTimeByAssigment(selectedAssignmentId).then(res => {
            if (res && res.ok && res.status === 200) {
                this.setState({ engagedTime: res.data });
            }
        });
    }

    handleDialog = (field, val) => {
      this.setState({ [field]: val })
    }

    render() {
        const { engagedTime, isOpenLocationPin } = this.state;
        const { shipmentStore, assignmentStore } = this.props;
        const { selectedStop, shipmentAddressInfo } = shipmentStore;
        const deletedStyle = (selectedStop && selectedStop._deleted) ? { boxShadow: '#d63031 0px 0px 2px' } : {};

        return <div style={{ ...deletedStyle }}>
            <div style={{ ...styles.boxContent, ...{ top: 0, left: 0, right: 0, bottom: 225, maxHeight: '100%', height: selectedStop ? 225 : 'calc(100% - 400px)', minHeight: '50%' } }}>
                <AssignmentMapContainer />
                {selectedStop && (
                  <Box position={'absolute'} top={8} left={8} border={'1px solid #525150'} borderRadius={'50%'} bgcolor={'#fff'}>
                    <IconButton onClick={() => this.handleDialog('isOpenLocationPin', true)} size='small'>
                      <PinDropIcon htmlColor='#2a2444'/>
                    </IconButton>
                  </Box>
                  )}
            </div>
            <div style={{ ...styles.bottomBox, ...{ height: selectedStop ? 'calc(100% - 225px)' : '400px', maxHeight: '50%' } }}>
                {!selectedStop && this.props.addingShipment && <AddingShipmentDetail closeMe={() => this.props.closeAddShipmentForm && this.props.closeAddShipmentForm()} />}

                {!selectedStop ?
                    <AssignmentBreakdown
                        engagedTime={engagedTime}
                        selectedAssignment={assignmentStore.selectedAssignment}
                        filteredStops={assignmentStore.filteredShowingStops} />
                    :
                    null
                }
                <Route path='*/stops/:stopId' component={ShipmentDetail} />
            </div>

            {isOpenLocationPin && <AxlDialog
              isOpen={isOpenLocationPin}
              children={<LocationPin shipmentAddressInfo={shipmentAddressInfo} selectedStop={selectedStop}/>}
              childrenTitle={'Location Pins'}
              handleClose={() => this.handleDialog('isOpenLocationPin', false)}
            />}
        </div>
    }
}

@inject('messengerStore', 'userStore')
@observer
class AssignmentDetailScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messengers: [],
            topicLoading: false,
            triggerMsgLoading: false,
            newTopic: false,
            creatingTopic: false,
            assignmentLoading: false,
            _isShowMessenger: false,
            showAddingShipmentDetail: false,
            showHistory: false
        }
        this.onShowAddingShipment = this.onShowAddingShipment.bind(this);
        if (this.props.match.params.assignmentId) {
            console.log('Load assignment')
            this.props.assignmentStore.loadAssignment(parseInt(this.props.match.params.assignmentId))
            // Close box-chat when select other assignment
            this.setState({ _isShowMessenger: false });
        }

    }

    componentDidMount() {
        const that = this;
        const { assignmentStore, messengerStore, match, history } = this.props;
        const { topicSelected } = messengerStore;
        const { selectedAssignment } = assignmentStore;

        window.onfocus = function () {
            assignmentStore.onFocus()
        };

        window.onblur = function () {
            assignmentStore.onBlur()
        };

        // request permission
        // foreground listen firebase
        this.props.firebase.requestPermissionPushNotifications().then(token => messengerStore.upsertToken(token, () => {
            // Subscribe
            messengerStore.subscribe();
            navigator.serviceWorker.onmessage = function (payload) {
                console.log('Dispatch screen - onMessage: ', payload);
                console.log('Dispatch screen - topicSelected: ', _.get(that, 'props.messengerStore.topicSelected'));
                messengerStore.markedAllViewed = false;
                const firebaseLiveTimeAttribute = 'data.firebase-messaging-msg-data.data';
                const firebaseBackgroundAttribute = 'data';
                const fibaseDataAttributes = _.get(payload, firebaseLiveTimeAttribute, null) ||
                    _.get(payload, firebaseBackgroundAttribute, null);
                const msgRefId = _.get(fibaseDataAttributes, 'messenger_ref_id');
                const msgTopicId = _.get(fibaseDataAttributes, 'messenger_topic_id');
                const isTopicSelected = _.isEqual(msgTopicId, _.get(that, 'props.messengerStore.topicSelectedId'));
                console.log('messenger store topic id', _.get(that, 'props.messengerStore.topicSelectedId'));
                // foreground when in chatbox
                if (isTopicSelected) {
                    that.setState({
                        triggerMsgLoading: true,
                    });
                    that.props.messengerStore.loadMessageByTopicId(payload.data.messenger_topic_id, res => {
                        if (res.status === 200 && res.ok) {
                            that.setState({
                                triggerMsgLoading: false,
                            });
                        }
                    });
                } else {
                    // Toast
                    toast(<MessengerToast payload={payload} history={history} />);
                }
                // foreground when out chatbox
                const reloadAssignmentConversations = payload.data &&
                    that.props.assignmentStore &&
                    that.props.assignmentStore.assignments.map(a => a.id === parseInt(msgRefId)).filter(a => a);
                if (reloadAssignmentConversations.length > 0) {
                    that.props.assignmentStore.loadAssignmentConversationSummary(reloadAssignmentConversations)
                }
            };
        }));
    }

    componentWillUnmount() {
        const { assignmentStore, messengerStore } = this.props
        assignmentStore.selectAssignment(null);
        messengerStore.topicSelected = null;
        messengerStore.topicSelectedId = null;
    }

    onSelectStop(s) {
        const { shipmentStore, assignmentStore, history } = this.props
        const { clients, regions, selectedAssignmentId, date, selectedAssignment } = assignmentStore
        if (s.id === shipmentStore.selectedStopId) {
            history.push(`/assignments/${selectedAssignmentId ? selectedAssignmentId : ''}`)
            shipmentStore.selectStop(null)
        } else {
            history.push(`/assignments/${selectedAssignmentId ? selectedAssignmentId : '-'}/stops/${s.id}`)
            const { clientProfiles } = selectedAssignment;
            if (clientProfiles && clientProfiles.length > 0) {
                s['client_profile'] = clientProfiles.find(cp => s && s.shipment && cp.id === s.shipment.client_profile_id);
            }
            shipmentStore.selectStop(s)
        }
    }

    hideStopEditForm = (e) => {
        this.props.history.goBack();
    };

    onShowAddingShipment() {
        const { shipmentStore } = this.props
        shipmentStore.unselectStop()
        this.setState({ showAddingShipmentDetail: !this.state.showAddingShipmentDetail })
    }

    onShowMessenger = () => {
        const { messengerStore, assignmentStore, userStore } = this.props;
        const { selectedAssignmentId, selectedAssignment } = assignmentStore;
        if (!this.state._isShowMessenger) {
            // Allow open topic when assign to driver
            this.setState({
                topicLoading: true,
                assignmentLoading: true
            });
            messengerStore.loadTopicByAssignmentId(selectedAssignmentId, (res) => {
                if (res.status === 200) {
                    if (userStore.user &&
                        messengerStore.topicSelected &&
                        messengerStore.topicSelected.follower_ids.indexOf(userStore.user.id) !== -1) {
                        this.props.messengerStore.isFollow = true;
                    } else {
                        this.props.messengerStore.isFollow = false;
                    }
                    this.setState({
                        topicLoading: false,
                        assignmentLoading: false
                    });
                } else if (res.status === 404) {
                    this.setState({
                        newTopic: true,
                        topicLoading: false,
                        assignmentLoading: false
                    });
                }
            });
        } else {
            messengerStore.topicSelected = null;
            messengerStore.topicSelectedId = null;
        }
        this.setState({ _isShowMessenger: !this.state._isShowMessenger });
    }

    dismissAll = () => toast.dismiss();

    _openTopic = () => {
        const { messengerStore, assignmentStore, userStore } = this.props;
        const { selectedAssignmentId, selectedAssignment } = assignmentStore;

        if (!selectedAssignmentId) return false;

        this.setState({ creatingTopic: true });

        messengerStore.generateTopic(selectedAssignmentId, (res) => {
            if (res.ok || res.status === 200) {
                if (userStore.user &&
                    messengerStore.topicSelected &&
                    messengerStore.topicSelected.follower_ids.indexOf(userStore.user.id) !== -1) {
                    this.props.messengerStore.isFollow = true;
                } else {
                    this.props.messengerStore.isFollow = false;
                }
                this.setState({
                    newTopic: false,
                    creatingTopic: false,
                    assignmentLoading: false
                });
            }
        });
    }

    render() {
        const { assignmentStore, history, match } = this.props
        const { params } = match || {}
        const { assignmentId } = params || {}
        const { selectedAssignment } = assignmentStore;
        const _isActiveAssignmentSelected = selectedAssignment && selectedAssignment.assignment && selectedAssignment.assignment.is_active;

        return (<ThemeProvider theme={lightTheme}>
            <Toast
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnVisibilityChange
                draggable
                pauseOnHover
            />
            {/* <TopHeaderContainer history={history} /> */}
            <Box height={'calc(100vh - 120px)'}>
                <Grid container alignItems="stretch" style={{ height: '100%' }} spacing={2} wrap={'nowrap'}>
                    <Grid item xs={4}>
                        <E.Container bgcolor={'primary.grayEleventh'} style={{height: '100%', overflow: 'hidden'}}>
                            <Box style={{...styles.panel, ...{overflow: 'auto', overflowX: 'hidden'}}}>
                                <Grid container justifyContent="space-between" alignItems="center" spacing={1} style={{padding: 6, paddingBottom: 0, fontSize: 14}}>
                                    <Grid item>
                                        {selectedAssignment && selectedAssignment.assignment && (
                                          <Box pl={2}>
                                              {selectedAssignment.assignment.region_code} - {moment.utc(selectedAssignment.assignment.predicted_start_ts).tz(selectedAssignment.assignment.timezone).format("YYYY-MM-DD")}
                                          </Box>
                                        )}
                                    </Grid>
                                    <Grid item>
                                        <Box>
                                            {!this.state.showHistory && <span style={{cursor: 'pointer'}} onClick={() => this.setState({showHistory: true})}>Open History</span> }
                                            {this.state.showHistory && <span style={{cursor: 'pointer'}} onClick={() => this.setState({showHistory: false})}>Close History</span> }
                                        </Box>
                                    </Grid>
                                </Grid>
                                <AssignmentDetailContainer onShowAddingShipment={this.onShowAddingShipment} onShowMessenger={this.onShowMessenger} history={this.props.history} />
                            </Box>
                        </E.Container>
                    </Grid>
                    <Grid item xs={4}>
                        <Box height={1} style={{ ...styles.panel }}>
                            <div style={{ ...Styles.box, ...styles.innerBox, ...styles.innerBoxShipment }}>
                                <div style={styles.boxContentShipment}>
                                    <ShipmentList onSelectStop={(s) => this.onSelectStop(s)} />
                                </div>
                            </div>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box height={1} style={{ ...Styles.box, ...styles.panel, ...styles.innerBox }}>
                        {!this.state._isShowMessenger ?
                            <ShipmentDetailContainer
                                {...this.props}
                                closeAddShipmentForm={this.onShowAddingShipment}
                                addingShipment={this.state.showAddingShipmentDetail} />
                            : <E.PanelMessenger>
                            <E.PanelMessengerInner style={{ ...Styles.box, ...{ width: '100%' } }}>
                                <ShipmentMessenger
                                    history={history}
                                    topicLoading={this.state.topicLoading}
                                    triggerMsgLoading={this.state.triggerMsgLoading}
                                    activeAssignment={_isActiveAssignmentSelected}
                                    assignmentLoading={this.state.assignmentLoading} />
                            </E.PanelMessengerInner>
                        </E.PanelMessenger>}
                        {this.state.showHistory && <div style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000}}>
                            <div style={{position: 'absolute', top: 0, left: 0, bottom: 0, width: 100, zIndex: 100, backgroundColor: '#666', opacity: 0.7}} onClick={() => this.setState({showHistory: false})}></div>
                            <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, left: 100, backgroundColor: 'white', padding: 12, paddingRight: 18, boxShadow: '0px 1px 1px #444'}}>
                                <EventAssignmentList baseUrl={`/events/assignments/${assignmentId}`} type='assignment' closePanel={this.closePanel} selectedAssignment={selectedAssignment} />
                            </div>
                        </div>}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>)
    }
}

export default compose(
    withRouter,
    withFirebase,
    inject('assignmentStore', 'shipmentStore', 'clientStore', 'messengerStore'),
    observer
)(AssignmentDetailScreen);
