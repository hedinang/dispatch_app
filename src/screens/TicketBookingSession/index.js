import React, { Component } from 'react';

import { Box, Checkbox, FormControlLabel, IconButton, Tooltip } from '@material-ui/core';
import { AxlButton, AxlCheckbox, AxlInput, AxlLoading, AxlModal, AxlTextArea, Styles } from 'axl-reactjs-ui';
import _ from 'lodash';
import { when } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddIcon from '@material-ui/icons/Add';
import AttachmentIcon from '@material-ui/icons/Attachment';
import BuildIcon from '@material-ui/icons/Build';
import RefreshIcon from '@material-ui/icons/Sync';
import MessageIcon from '@material-ui/icons/Message';
import ScheduleIcon from '@material-ui/icons/Schedule';

import DialogSMSCost from '../../components/DialogSMSCost';
import { EventTemplates } from '../../components/EventTemplates';
import ModalAddOrEditTicketBook from '../../components/TicketBookGroup/ModalAddOrEditTicketBook';
import TicketBookingSessionInfo from '../../components/TicketBookingSessionInfo';
import TicketHistory from "../../components/TicketHistory";
import TooltipContainer from '../../components/TooltipContainer';
import { ACTIONS } from '../../constants/ActionPattern';
import { TICKET_STATUS } from '../../constants/colors';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import TicketAssignmentContainer from '../../containers/TicketAssignment';
import TicketBookContainer from '../../containers/TicketBook';
import TicketDetailContainer from '../../containers/TicketDetail';
import DialogCreateBookingSessionTicket from '../../components/DialogCreateBookingSessionTicket';

import { getEvents } from '../../stores/api';
import styles from './styles';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import { getAppFeatures } from '../../stores/api';

@inject('bookingStore', 'ticketStore', 'userStore', 'eventStore','warehouseStore', 'permissionStore')
@observer
class TicketBookingSessionScreen extends Component {
  constructor(props) {
    super(props)
    this.goBack = this.goBack.bind(this)
    this.onSelectTicket = this.onSelectTicket.bind(this)
    this.onSelectAssignment = this.onSelectAssignment.bind(this)
    this.loadSession = this.loadSession.bind(this)
    this.refreshSession = this.refreshSession.bind(this)
    this.onSendMessage = this.onSendMessage.bind(this)
    this.onChangeMaxReservation = this.onChangeMaxReservation.bind(this)
    this.state = {
      showUnBooked: true,
      showUnClaimed: true,
      showClaimed: false,
      showCompleted: false,
      selectedTicket: '',
      selectedBook: '',
      crews: null,
      isFetched: false,
      isAddNew: false,
      isPromotional: true,
      openCreateBookingSessionDialog: false,
      enableCreateDirectBooking: false,
    }
  }

  EXCLUDED_ACTIONS = [
    "book", "unbook", "claim", "unclaim", "assign", "unassign", "reassign"
  ];

  componentDidMount() {
    this.loadSession();
    this.getCrews();
    const { bookingStore } = this.props
    bookingStore.loadActiveSessions()
    this.timer = setInterval(() => this.reloadSession(), 10000);

    when(
      () => this.props.userStore.isAdmin,
      () => this._callWarehouse()
    )
  }

  _callWarehouse() {
    const { bookingStore, warehouseStore, userStore } = this.props;
    const { isAdmin } = userStore;
    const regions = bookingStore && bookingStore.regionsStr && bookingStore.regionsStr.split(',') || [];
    if(regions && regions.length == 0) {
      warehouseStore.warehouses = [];
      return;
    }
    if(isAdmin && !(warehouseStore && warehouseStore.warehouses && warehouseStore.warehouses.some(f => regions.includes(f.region)))) {
      warehouseStore.getWarehouses(regions)
    }
  }

  componentWillReceiveProps(props) {
    const { match, bookingStore, eventStore } = props
    const { params } = match || {}
    if (!params) return
    if (params.id === this.props.match.params.id) return
    bookingStore.loadSession(params.id)
    eventStore.loadEvents(params.id)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  loadSession() {
    const { match, bookingStore, eventStore } = this.props
    const { params } = match
    bookingStore.loadSession(params.id, (r) => {
      if(r.ok) {
        this._callWarehouse()
        this.getAppFeatureConfig();
      }
    })
  }

  getAppFeatureConfig() {
    const { bookingStore } = this.props;
    const { regionsStr } = bookingStore;

    const regions = regionsStr
      .split(',')
      .map(_.trim)
      .filter(Boolean)
      .map((region) => `RG_${region}`);

    const owners = [...regions, 'AP_DEFAULT'];

    getAppFeatures(owners).then((response) => {
      if (!response.data) return;

      const { enable_create_direct_booking_from_ticket: enableCreateDirectBooking } = response.data;
      this.setState({ enableCreateDirectBooking });
    });
  }

  reloadSession() {
    const { match, bookingStore, eventStore } = this.props
    const { params } = match
    bookingStore.reloadSession()
  }

  refreshSession() {
    const { match, bookingStore, eventStore } = this.props
    const { params } = match
    bookingStore.refreshSession();
    eventStore.loadEvents(params.id)
  }

  getCrews = () => {
    const { match, bookingStore, eventStore } = this.props
    const { params } = match
    return bookingStore.getCrews(params.id).then(resp => {
      if (resp.ok) {
        this.setState({crews: resp.data});
      }
    });
  }

  onChangeMaxReservation() {
    const { bookingStore } = this.props
    const {activeSession} = bookingStore
    const { edittingValue } = this.state

    if (edittingValue && edittingValue !== activeSession.session.max_reservation)
    bookingStore.updateMaxReservation(parseInt(edittingValue)).then(() => {
      this.setState({settingLimit: false})
    })
  }


  onSelectTicket(t) {
    const { history, match } = this.props;
    const { params } = match;
    const {selectedTicket} = this.state;

    if (selectedTicket === t.id) {
      this.setState({selectedTicket: '', selectedAssignment: 0});
      history.push(`/ticket-booking/${params.id}`);
    } else {
      this.setState({selectedTicket: t.id, selectedAssignment: 0});
      history.push(`/ticket-booking/${params.id}/ticket/${t.id}`);
    }
  }

  unselectTicket = () => {
    this.setState({selectedTicket: '', selectedAssignment: 0});
  }

  onSelectAssignment(a, book) {
    const { history, match } = this.props;
    const { params } = match;
    const {selectedAssignment} = this.state;

    if (selectedAssignment === a.id) {
      this.setState({selectedAssignment: 0, selectedBook: ''});
      history.push(`/ticket-booking/${params.id}`);
    } else {
      this.setState({selectedTicket: null, selectedAssignment: a.id, selectedBook: book.id});
      history.push(`/ticket-booking/${params.id}/assignment/${a.id}`);
    }
  }

  goBack() {
    const { history } = this.props
    history.push('/ticket-booking')
  }

  onSendMessage() {
    const { match, bookingStore, eventStore } = this.props;
    const {message, toAll, isPromotional} = this.state;
    const { params } = match
    bookingStore.sendMessage(message, toAll, isPromotional).then((v) => {
      eventStore.loadEvents(params.id);
    })
    this.setState({sendingMessage: false})
  }

  getEstimatedSMS() {
    const { match, bookingStore, eventStore } = this.props;
    const {message, toAll, isPromotional} = this.state;
    const { params } = match
    bookingStore.getEstimateSMS(message, toAll, isPromotional).then((v) => {
      if(v.ok) {
        this.setState({SMSCost: v.data})
      } else {
        toast.error("Can't send SMS to drivers");
        this.setState({sendingMessage: false});
      }
    })
  }
  clearSMSCost = () => {
    this.setState({SMSCost: null})
  }
  onRefreshAssignments = () => {
    const { bookingStore, userStore } = this.props
    const { isAdmin } = userStore;
    const { activeSession} = bookingStore;

    if (isAdmin && activeSession && activeSession.session) {
      bookingStore.refreshBookingAssignments(activeSession.session.id);
    }
  }

  addCrews = (id, crewIds) => {
    return this.props.bookingStore.addCrews(id, crewIds);
  }

  searchDriver = (id, keyword) => {
    return this.props.bookingStore.searchDriver(id, keyword);
  }

  handleShowDialog = () => {
    this.setState({isAddNew:true});
  }

  handleCloseDialog = () => {
    this.setState({isAddNew:false});
  }

  handleChangePromotional = (e) => {
    if(!e || !e.target) return;

    const {checked} = e.target;
    this.setState({isPromotional: checked});
  }

  handleOpenCreateBookingSessionDialog = () => {
    this.setState({ openCreateBookingSessionDialog: true });
  };

  handleCloseCreateBookSessionDialog = () => {
    this.setState({ openCreateBookingSessionDialog: false });
  };

  render() {
    const { bookingStore, match, userStore, history, warehouseStore, permissionStore } = this.props
    const { isAddNew, enableCreateDirectBooking } = this.state;
    const { activeSession, loading, activeSessions } = bookingStore
    const { params } = match
    const { assignments, books } = activeSession || {}
    const cando = activeSession && activeSession.attributes && activeSession.attributes.cando ? activeSession.attributes.cando.split(',') : []
    const canAdd = cando.indexOf('add-assignment') >= 0

    /* ENG-2253: allow all dispatchers to see ticket groups even if empty */
    const activeBooks = books

    const timezone = assignments == null || assignments.length < 1 ? null : assignments[0].timezone
    const { isAdmin, isLeadDispatcher } = userStore

    const canRefreshAssignments = !!activeSession && !!activeSession.session;
    const zoneIds = _.map(bookingStore && bookingStore.activeSession && bookingStore.activeSession.session && bookingStore.activeSession.session.groups, 'unique_id');
    const filterZones = bookingStore && bookingStore.zones && bookingStore.zones.filter(f => !zoneIds.includes(f.id))
    const disableAddBookingGroup = filterZones === null || filterZones === undefined || filterZones.length === 0;

    const isDeniedChangeBookingLimit = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.CHANGE_BOOKING_LIMIT);
    const isDeniedCreateBookingSession = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.CREATE_DIRECT_BOOKING_SESSION);

    return <React.Fragment>
      {loading && (
        <div style={styles.processing}>
          <AxlLoading />
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={{ ...styles.panel, ...{ width: '400px', minWidth: '280px' } }}>
            <div style={{ ...Styles.box, ...styles.innerBox }}>
              <div style={styles.topBox}>
                <TicketBookingSessionInfo history={history} isAdmin={isAdmin} isLeadDispatcher={isLeadDispatcher} searchDriver={this.searchDriver} getCrews={this.getCrews} addCrews={this.addCrews} session={activeSession} others={activeSessions} crews={this.state.crews} />
                <div style={{ backgroundColor: '#f8f8f8' }}>
                  <Tooltip title="Send message">
                    <IconButton onClick={() => this.setState({sendingMessage: true})} style={styles.actionButton}>
                      <MessageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh session">
                    <IconButton onClick={this.refreshSession} style={styles.actionButton}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {(isAdmin || isLeadDispatcher) && (
                    <TooltipContainer title={isDeniedChangeBookingLimit ? PERMISSION_DENIED_TEXT : 'Change booking limit'} arrow={false}>
                      <IconButton disabled={isDeniedChangeBookingLimit} onClick={() => this.setState({settingLimit: true, edittingValue: activeSession.session.max_reservation})} style={styles.actionButton}>
                        <BuildIcon fontSize="small" />
                      </IconButton>
                    </TooltipContainer>
                  )}
                  {canRefreshAssignments && isAdmin &&
                    <Tooltip title="Refresh assignments">
                      <IconButton onClick={this.onRefreshAssignments} style={styles.actionButton}>
                        <AttachmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }

                  { isAdmin &&
                    <Tooltip title="Add new ticket book group">
                      <IconButton onClick={this.handleShowDialog} style={{...styles.actionButton, border: disableAddBookingGroup ? '1px solid rgba(0, 0, 0, 0.26)' : '1px solid #4a4a4a'}} disabled={disableAddBookingGroup}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  {enableCreateDirectBooking && (
                    <Tooltip title={isDeniedCreateBookingSession ? PERMISSION_DENIED_TEXT : "Create Direct booking"}>
                      <IconButton onClick={this.handleOpenCreateBookingSessionDialog} style={styles.actionButton} disabled={isDeniedCreateBookingSession}>
                        <ScheduleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div style={{ flex: '1 1 auto', padding: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <Box mb={1} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                  <Box color={'#888'} fontSize={'0.9em'} mr={1}>Activity History</Box>
                </Box>
                <EventTemplates
                  getEventList={getEvents} 
                  historyId= {params.id} 
                  targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
                  owners={[EVENT_TEMPLATE_OWNERS.TICKET_BOOKING]}
                  isWithoutSecond={false}
                  filterEvent={(e) => params.id && params.id.startsWith("BS_") ? !this.EXCLUDED_ACTIONS.includes(e.action) : true}
                  canRefresh={true}
                  canSearch={false}
                  canFilter={true}
                  isFilter={true}
                  urlParams={{
                    rel: true
                  }}
                  containerStyles={{overflow: 'auto'}}
                />
              </div>
            </div>
          </div>
          <div style={{ ...styles.panel, ...{ flex: 1.5, minWidth: '420px' } }}>
            <div style={{ ...Styles.box, ...styles.innerBox, ...{ backgroundColor: '#fff' } }}>
              <div style={{ display: 'flex', padding: '10px', height: 20, boxShadow: '0px 1px 2px #444' }}>
                <div style={{ flex: 1 }}>
                  <AxlCheckbox theme={`main`} color={`white`} defaultChecked={this.state.showCompleted} onChange={v => this.setState({ showCompleted: v.target.checked })} data-testid="booking-completed-checkbox"><span style={TICKET_STATUS.COMPLETED}>Completed</span></AxlCheckbox>
                </div>
                <div style={{ flex: 1 }}>
                  <AxlCheckbox theme={`main`} color={`white`} defaultChecked={this.state.showClaimed} onChange={v => this.setState({ showClaimed: v.target.checked })} data-testid="booking-claimed-checkbox"><span style={TICKET_STATUS.CLAIMED}>Claimed</span></AxlCheckbox>
                </div>
                <div style={{ flex: 1 }}>
                  <AxlCheckbox theme={`main`} color={`white`} defaultChecked={this.state.showUnClaimed} onChange={v => this.setState({ showUnClaimed: v.target.checked })} data-testid="booking-unclaimed-checkbox"><span style={TICKET_STATUS.PENDING}>UnClaimed</span></AxlCheckbox>
                </div>
                <div style={{ flex: 1 }}>
                  <AxlCheckbox theme={`main`} color={`white`} defaultChecked={this.state.showUnBooked} onChange={v => this.setState({ showUnBooked: v.target.checked })} data-testid="booking-unbooked-checkbox"><span style={TICKET_STATUS.UNBOOKED}>UnBooked</span></AxlCheckbox>
                </div>
              </div>

              <div style={{ flex: '1 1 auto', overflow: 'auto', backgroundColor: '#f4f4f4' }}>
                {!activeSession && !loading && (
                  <div style={{color: 'red', padding: 10}}>Failed to load booking session!</div>
                )}
                {activeBooks && activeBooks.map(book =>
                  <TicketBookContainer
                    cando={cando}
                    book={book}
                    key={book.id}
                    selected={this.state.selectedTicket}
                    selectedAssignment={this.state.selectedAssignment}
                    drivers={activeSession.drivers}
                    onSelect={this.onSelectTicket}
                    onSelectAssignment={this.onSelectAssignment}
                    showUnBooked={this.state.showUnBooked}
                    showUnClaimed={this.state.showUnClaimed}
                    showClaimed={this.state.showClaimed}
                    showCompleted={this.state.showCompleted}
                    warehouses={warehouseStore.warehouses}
                  />)}
              </div>
            </div>
          </div>
          <div style={{ ...styles.panel, ...{ flex: 2, minWidth: '420px' } }}>
            <div style={{ ...Styles.box, ...styles.innerBox, ...{ backgroundColor: '#fff' } }}>
              <Switch>
                <Route path={"/ticket-booking/:id/ticket/:tid/history"}
                       component={TicketHistory}
                />
                <Route path={"/ticket-booking/:id/ticket/:tid"}
                       render={props => <TicketDetailContainer timezone={timezone} onUpdate={() => this.reloadSession()} onUnselect={this.unselectTicket} id={props.match.params.tid} sid={props.match.params.id} history={this.props.history} />}
                />
                <Route path="/ticket-booking/:id/assignment/:aid"
                       render={props => <TicketAssignmentContainer timezone={timezone} id={props.match.params.aid} sid={props.match.params.id} bookId={this.state.selectedBook} history={this.props.history} />}
                />
              </Switch>
            </div>
          </div>
        </div>
      </div>

      { this.state.sendingMessage && <AxlModal onClose={() => this.setState({ sendingMessage: false })} style={{ width: 600, minHeight: 160, maxHeight: 800, paddingBottom: 0, paddingTop: 20 }}>
        <h4>Sending SMS</h4>
        <div>
          <Box >
            <FormControlLabel
              control={<Checkbox color='primary' defaultChecked={this.state.toAll} onChange={ (v) => this.setState({toAll: v.target.checked})} />}
              label="Send to All Drivers"
            />
            <FormControlLabel
              control={<Checkbox color='primary' defaultChecked={this.state.isPromotional} onChange={this.handleChangePromotional} />}
              label="Is Promotional"
            />
          </Box>
        </div>
        <div>
        <div style={{padding: '4px 15px'}}>
         <AxlTextArea style={{width: '100%', height: '120px'}} name='reason' value={this.state.message} onChange={(v) => this.setState({message: v.target.value})} />
        </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{ flex: 1 }}><AxlButton block={true} circular={true} onClick={() => this.onSendMessage() }>Send SMS</AxlButton></div>
          <div style={{ flex: 1 }}><AxlButton block={true} bg={'black'} circular={true} onClick={ () => this.setState({sendingMessage: false}) }>Cancel</AxlButton></div>
        </div>
      </AxlModal>}

      { this.state.settingLimit && <AxlModal onClose={() => this.setState({settingLimit: false}) } style={{width: 600, minHeight: 200, maxHeight: 800, paddingBottom: 60, paddingTop: 20}}>
        <h4>Update Booking limit</h4>
        <p>Current limit: <b>{ activeSession.session.max_reservation }</b></p>
        <AxlInput defaultValue={activeSession.session.max_reservation} type={'number'} onChange={(v) => this.setState({edittingValue: v.target.value}) } />
        <div style={{display: 'flex', padding: 10}}>
          <div style={{flex: 1}}>
            <AxlButton block={true} circular={true} onClick={ this.onChangeMaxReservation } >Save</AxlButton>
          </div>
          <div style={{flex: 1}}>
            <AxlButton block={true} circular={true} bg={'black'} onClick={() => this.setState({settingLimit: false})}>Cancel</AxlButton>
          </div>
        </div>
        <p>Booking limit controls the maximum number of tickets 1 driver can reserve at any moment, excluding those that have been claimed and <b>COMPLETED</b></p>
      </AxlModal>}
      {
        isAddNew && (
          <ModalAddOrEditTicketBook open={isAddNew} handleClose={() => this.handleCloseDialog()} bookingStore={bookingStore} warehouses={warehouseStore.warehouses}/>
        )
      }
      <DialogSMSCost SMSCost={this.state.SMSCost} callbackSmsAction={() => this.onSendMessage()} clearSMSCost={() => this.clearSMSCost()}></DialogSMSCost>
      <DialogCreateBookingSessionTicket open={this.state.openCreateBookingSessionDialog} onClose={this.handleCloseCreateBookSessionDialog} />
    </React.Fragment>
  }
}

export default TicketBookingSessionScreen
