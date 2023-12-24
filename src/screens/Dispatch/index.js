import React, { Component, Fragment } from 'react';
import { Styles, AxlPanelSlider, AxlButton, AxlLoading } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import {withRouter, Route, Switch} from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import { compose } from 'recompose';
import {Box, Grid, Hidden, Button, ThemeProvider, IconButton} from "@material-ui/core";
import PinDropIcon from '@material-ui/icons/PinDrop';

// Components
import AssignmentList from '../../containers/AssignmentList/index';
import AssignmentDetail from '../../containers/AssignmentDetail/index';
import ShipmentList from '../../containers/ShipmentList/index';
import ShipmentDetail from '../../containers/ShipmentDetail/index';
import AssignmentMap from '../../components/AssignmentMap/index';
import AssignmentsStats from '../../containers/AssignmentsStats/index';
import DispatchSearchFilter from '../../containers/DispatchSearchFilter/index'
import AssignmentListMap from '../../containers/AssignmentListMap/index';
import { EventAssignmentList } from "../../components/EventAssignmentList";
import AddingShipmentDetail from "../../components/AddingShipmentDetail";
import ShipmentMessenger from "../../containers/ShipmentMessenger";
import AssignmentBreakdown from '../../components/AssignmentBreakdown/index';
import Toast, {ToastContainerStyled} from "../../components/Toast";
// Styles
import styles, * as E from './styles';
import Firebase, {withFirebase} from "../../components/Firebase";
import MessengerToast from "../MessengerToast";
import {lightTheme} from "../../themes";
import {FRANKENROUTE_SCOPES} from "../../constants/shipment";
import AxlDialog from '../../components/AxlDialog';
import LocationPin from './locationPin';

class DispatchAssignmentListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false
    }
    this.onCollapse = this.onCollapse.bind(this);
  }

  onCollapse() {
    this.setState({collapse: !this.state.collapse})
  }

  render() {
    const { collapse } = this.state;

    return <E.Container bgcolor={'primary.grayEleventh'} style={{height: '100%'}}>
      <Box height={1}>
        <Grid container direction={'column'} style={{height: '100%'}}>
          <Grid item xs style={{overflow: 'hidden', paddingBottom: 16}}>
            <Box p={2} bgcolor={'primary.grayEleventh'} borderRadius={4} height={1}><AssignmentList history={this.props.history} /></Box>
          </Grid>
          <Grid item>
            <Box height={collapse ? '46px' : '325px'}>
              <AssignmentsStats onCollapse={this.onCollapse} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </E.Container>
  }
}

@inject('assignmentStore')
@observer
class DispatchAssignmentDetailContainer extends Component {

  render() {
    const { assignmentStore } = this.props
    const { selectedAssignment } = assignmentStore;

    return <AssignmentDetail assignmentInfo = { selectedAssignment } onShowAddingShipment = {this.props.onShowAddingShipment} onShowMessenger = {this.props.onShowMessenger} history={this.props.history} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} />
  }
}

@inject('assignmentStore', 'shipmentStore')
@observer
class DispatchAssignmentMapContainer extends Component {
  render() {
    const { assignmentStore, shipmentStore } = this.props
    const { selectedStop, previewShipment } = shipmentStore
    const { selectedAssignment } = assignmentStore;

    return selectedAssignment ? <AssignmentMap previewShipment={previewShipment} assignment = { selectedAssignment } locations={ selectedAssignment ? selectedAssignment.locations : null } driverLocation={ selectedAssignment ? selectedAssignment.driverLocation : null } shipment = { selectedStop ? selectedStop.shipment : null} /> : null
  }
}

@inject('assignmentStore', 'shipmentStore')
@observer
class DispatchShipmentDetailContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      engagedTime: null,
      isOpenLocationPin: false,
    }
  }

  componentDidMount() {
    const {assignmentStore} = this.props;
    const {selectedAssignmentId} = assignmentStore;
    if(selectedAssignmentId) {
      this._getEngagementTime(selectedAssignmentId);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {assignmentStore} = this.props;
    const {selectedAssignmentId} = assignmentStore;
    if(!_.isEqual(prevProps.match.params, this.props.match.params)) {
      this._getEngagementTime(selectedAssignmentId);
    }
  }

  _getEngagementTime = (selectedAssignmentId) => {
    const {assignmentStore} = this.props;

    assignmentStore.getEngageTimeByAssigment(selectedAssignmentId).then(res => {
      if(res && res.ok && res.status === 200) {
        this.setState({engagedTime: res.data});
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
    const deletedStyle = (selectedStop && selectedStop._deleted) ? { boxShadow: '#d63031 0px 0px 2px'} : {};

    return <div style={{...Styles.box, ...styles.innerBox, ...deletedStyle}}>
        <div style={{ ...styles.boxContent, ...{top: 0, left: 0, right: 0, bottom: 225, maxHeight: '100%', height: selectedStop ? 225 : 'calc(100% - 400px)', minHeight: '50%'}}}>
            <DispatchAssignmentMapContainer />
            {selectedStop && (
              <Box position={'absolute'} top={8} left={8} border={'1px solid #525150'} borderRadius={'50%'} bgcolor={'#fff'}>
                <IconButton onClick={() => this.handleDialog('isOpenLocationPin', true)} size='small'>
                  <PinDropIcon htmlColor='#2a2444'/>
                </IconButton>
              </Box>
            )}
        </div>
        <div style={{ ...styles.bottomBox, ...{height: selectedStop ? 'calc(100% - 225px)' : '400px', maxHeight: '50%'}}}>
            {!selectedStop && this.props.addingShipment && <AddingShipmentDetail closeMe={() => this.props.closeAddShipmentForm && this.props.closeAddShipmentForm()} />}

            {!selectedStop?
              <AssignmentBreakdown
                engagedTime={engagedTime}
                selectedAssignment={assignmentStore.selectedAssignment}
                filteredStops={assignmentStore.filteredShowingStops}/>
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

@inject('assignmentStore', 'userStore')
@observer
class TopHeaderContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHistoryPanel: false,
      open: {
        'FILTER': false,
      }
    }
  }

  componentDidUpdate() {
    const { assignmentStore } = this.props
    const { selectedAssignmentId } = assignmentStore;
    if(!selectedAssignmentId && this.state.showHistoryPanel) {
      this.closePanel();
    }
  }

  closePanel = () => {
    this.setState({showHistoryPanel: false});
  }

  toggle = (name) => {
    this.setState({open: {[name]: !(this.state.open && this.state.open[name])}});
  }

  render() {
    const { assignmentStore, userStore, history } = this.props
    const { selectedAssignmentId, loadingAssignment, selectedAssignment } = assignmentStore;
    const {user} = userStore;
    const {open} = this.state;
    const canUseFrankenroute = !!user && !!user.scopes && user.scopes.some(sc => FRANKENROUTE_SCOPES.includes(sc));

    return <Box textAlign={'left'}>
      <Grid container>
        <Hidden lgUp>
          <Grid item><AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-filter'}} onClick={() => this.toggle('FILTER')} /></Grid>
        </Hidden>
        <Grid item xs>
          <E.FilterContainer className={open && open['FILTER'] ? 'active' : ''}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <DispatchSearchFilter />
              </Grid>
              <Grid item>
                {canUseFrankenroute && (
                  <Box>
                    <Button color="primary" variant="contained"
                            size="small" disableElevation
                            onClick={() => history.push("/frankenroute")}
                    >
                      + Frankenroute
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </E.FilterContainer>
        </Grid>
        <Grid item data-testid="top-header-show-history-assignment-icon">{selectedAssignmentId && <AxlButton bg={`gray`} compact={true} ico={{className: 'fa fa-history'}} onClick={() => this.setState({showHistoryPanel: !this.state.showHistoryPanel})} />}</Grid>
      </Grid>
      {this.state.showHistoryPanel && <AxlPanelSlider style={styles.AxlPanelSliderStyle}>
        {selectedAssignmentId && !loadingAssignment && <EventAssignmentList baseUrl={`/events/assignments/${selectedAssignmentId}`} type='assignment' closePanel={this.closePanel} selectedAssignment={selectedAssignment}/>}
      </AxlPanelSlider> }
    </Box>
  }
}

@inject('messengerStore', 'userStore')
@observer
class DispatchScreen extends Component {
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
      showAddingShipmentDetail: false
    }
    this.onShowAddingShipment = this.onShowAddingShipment.bind(this);
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
      navigator.serviceWorker.onmessage = function(payload) {
        console.log('Dispatch screen - onMessage: ', payload);
        console.log('Dispatch screen - topicSelected: ', _.get(that, 'props.messengerStore.topicSelected'));
        messengerStore.markedAllViewed      = false;
        const firebaseLiveTimeAttribute     = 'data.firebase-messaging-msg-data.data';
        const firebaseBackgroundAttribute   = 'data';
        const fibaseDataAttributes          = _.get(payload, firebaseLiveTimeAttribute, null) ||
                                              _.get(payload, firebaseBackgroundAttribute, null);
        const msgRefId                      = _.get(fibaseDataAttributes, 'messenger_ref_id');
        const msgTopicId                    = _.get(fibaseDataAttributes, 'messenger_topic_id');
        const isTopicSelected               = _.isEqual(msgTopicId, _.get(that, 'props.messengerStore.topicSelectedId'));
        console.log('messenger store topic id', _.get(that, 'props.messengerStore.topicSelectedId'));
        // foreground when in chatbox
        if(isTopicSelected) {
          that.setState({
            triggerMsgLoading: true,
          });
          that.props.messengerStore.loadMessageByTopicId(payload.data.messenger_topic_id, res => {
            if(res.status === 200 && res.ok) {
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
        const isReloadAssignmentConversation = payload.data &&
          that.props.assignmentStore &&
          that.props.assignmentStore.assignments.map(a => a.id === parseInt(msgRefId)).filter(a => a).length;
        if(isReloadAssignmentConversation) {
          that.props.assignmentStore.loadAssignmentConversationSummary()
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { messengerStore } = this.props;
    if(this.props.match.params.assignmentId && !_.isEqual(prevProps.match.params, this.props.match.params)) {
      this.props.assignmentStore.loadAssignment(parseInt(this.props.match.params.assignmentId))
      // Close box-chat when select other assignment
      this.setState({_isShowMessenger: false});
    }
  }

  onSelectStop(s) {
      const { shipmentStore, assignmentStore, history } = this.props
      const { clients, regions, selectedAssignmentId, date, selectedAssignment } = assignmentStore
      let day = moment(date).format('YYYY-MM-DD')
      let region = regions.length > 0 ? regions.join(',') : 'all'
      let client = clients.length > 0 ? clients[0] : 'all'
      if (s.id === shipmentStore.selectedStopId) {
        history.push(`/routes/${day}/${region}/${client}/${selectedAssignmentId ? selectedAssignmentId : ''}${history.location && history.location.search ? history.location.search : ""}`)
        shipmentStore.selectStop(null)
      } else {
        history.push(`/routes/${day}/${region}/${client}/${selectedAssignmentId ? selectedAssignmentId : '-'}/stops/${s.id}${history.location && history.location.search ? history.location.search : ""}`)
        const { clientProfiles } = selectedAssignment;
        if (clientProfiles && clientProfiles.length > 0) {
          s['client_profile'] = clientProfiles.find(cp => s && s.shipment && cp.id === s.shipment.client_profile_id);
        }
        shipmentStore.selectStop(s)
      }
    }

  showAssignmentDetail(a, addShipmentId) {
      const { assignmentStore, shipmentStore, history } = this.props
      let day = assignmentStore.date
      let region = assignmentStore.regions.length > 0 ? assignmentStore.regions[0] : 'all'
      let client = assignmentStore.clients.length > 0 ? assignmentStore.clients[0] : 'all'
      if (a)
        history.push(`/routes/${day}/${region}/${client}/${a.id}`)
      else
        history.push(`/routes/${day}/${region}/${client}`)
      assignmentStore.selectAssignment(a)
      shipmentStore.unselectStop()

      if (addShipmentId) {
        shipmentStore.getPreviewShipment(addShipmentId);
        this.setState({showAddingShipmentDetail: true});
      }
    }

  hideStopEditForm = (e) => {
      this.props.history.goBack();
  };

  onShowAddingShipment() {
    this.setState({showAddingShipmentDetail: !this.state.showAddingShipmentDetail})
  }

  onShowMessenger = () => {
    const { messengerStore, assignmentStore, userStore } = this.props;
    const { selectedAssignmentId, selectedAssignment } = assignmentStore;
    if(!this.state._isShowMessenger) {
      // Allow open topic when assign to driver
      this.setState({
        topicLoading: true,
        assignmentLoading: true
      });
      messengerStore.loadTopicByAssignmentId(selectedAssignmentId, (res) => {
        if(res.status === 200) {
          if(userStore.user &&
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
        } else if(res.status === 404) {
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
    this.setState({_isShowMessenger: !this.state._isShowMessenger});
  }

  dismissAll = () =>  toast.dismiss();

  _openTopic = () => {
    const { messengerStore, assignmentStore, userStore } = this.props;
    const { selectedAssignmentId, selectedAssignment } = assignmentStore;

    if(!selectedAssignmentId) return false;

    this.setState({creatingTopic: true});

    messengerStore.generateTopic(selectedAssignmentId, (res) => {
      if(res.ok || res.status === 200) {
        if(userStore.user &&
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
      const { assignmentStore, history } = this.props
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
        <TopHeaderContainer history={history} />
        <Box height={'calc(100vh - 152px)'}>
            <Grid container alignItems="stretch" style={{height: '100%'}} spacing={2} wrap={'nowrap'}>
              <Grid item xs={4}>
                <DispatchAssignmentListContainer history={history} />
              </Grid>
              <Switch>
                <Route
                  path='/routes/:date/:region/:client/:assignment_id'
                  render={props => <Fragment>
                      <Grid item xs={4}>
                        <Box height={1} style={{...styles.panel, ...{position: 'relative'}}}>
                          <E.BackRoutesPanel onClick={() => {
                            this.setState((state) => {
                              history.push(`/routes/${props.match.params.date}/${props.match.params.region}/${props.match.params.client}`);
                              assignmentStore.selectAssignment(null)
                              return ({_isShowMessenger: !state._isShowMessenger})
                            });
                          }} />
                          <div style={{...Styles.box, ...styles.innerBox, ...styles.innerBoxShipment}}>
                            <div style={styles.boxContentShipment}>
                              <ShipmentList onClose={() => this.showAssignmentDetail(null, null)} onSelectStop = { (s) => this.onSelectStop(s) } />
                            </div>
                            <div style={styles.bottomBoxShipment}>
                              <DispatchAssignmentDetailContainer onShowAddingShipment = {this.onShowAddingShipment} onShowMessenger = {this.onShowMessenger} history={this.props.history} />
                            </div>
                          </div>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        {!this.state._isShowMessenger ? <div style={{...styles.panel}}>
                          <DispatchShipmentDetailContainer
                            {...props}
                            closeAddShipmentForm={this.onShowAddingShipment}
                            addingShipment = {this.state.showAddingShipmentDetail} />
                        </div> : <E.PanelMessenger>
                          <E.PanelMessengerInner style={{...Styles.box, ...{width: '100%'}}}>
                            <ShipmentMessenger
                              history={history}
                              topicLoading={this.state.topicLoading}
                              triggerMsgLoading={this.state.triggerMsgLoading}
                              activeAssignment={_isActiveAssignmentSelected}
                              assignmentLoading={this.state.assignmentLoading} />
                          </E.PanelMessengerInner>
                        </E.PanelMessenger>}
                      </Grid>
                  </Fragment>}
                />
                <Route
                  exact
                  render={() => <Grid item xs={8}>
                    <AssignmentListMap showAssignmentDetail={(assignment, shipmentId) => this.showAssignmentDetail(assignment, shipmentId)} />
                  </Grid>}
                />
              </Switch>
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
)(DispatchScreen);
